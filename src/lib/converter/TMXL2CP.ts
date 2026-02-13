import type { Manifest } from "$lib/types"
import { converterOutputLog, logOutput } from "../../stores";
import { catchAndNotify } from "../../util"
import JSON5 from 'json5'
import JSZip from 'jszip';
import BaseConverter from "./base";
import { tBIN } from '../external/tbin/src/index'
import { FileWarning } from "lucide-svelte";
import getTmxFromTbin from "$lib/translation/tbin-tmx";

const mapNameToDate = (mapName: string) => ({
    'Town-EggFestival': 'spring13',
    'Forest-FlowerFestival': 'spring24',
    'Beach-Luau': 'summer11',
    'Beach-Jellies': 'summer28',
    'Town-Fair': 'fall16',
    'Town-Halloween': 'fall27',
    'Forest-IceFestival': 'winter8',
    'Town-Christmas': 'winter25',
}[mapName])

const inventoryTypeToQualified = (type: string) => {
    return {
        Object: '(O)',
        MeleeWeapon: '(W)',
        Wallpaper: '(WP)',
        Furniture: '(F)',
    }[type] ?? ''
}

export default class TMXL2CP extends BaseConverter {

    constructor(public manifest: Manifest, public files: File[]) {
        super(manifest, files, 'platonymous.tmxloader', 'TMXL2CP')
    }

    convert() {
        return new Promise<string | null>(async resolve => {
            const uid = this.manifest.UniqueID

            const contentFile = this.files.find(x => x.name == 'content.json')
            if (!contentFile) return null

            const content: any | null | undefined = await catchAndNotify(
                async () => JSON5.parse((await contentFile.text())),
            'Unreadable content.json selected!') as any | null | undefined
            if (!content ) return null

            const customMapNames = []

            if (content.festivalSpots) {
                for (const spot of content.festivalSpots) {
                    const { map, name, position } = spot
                    const { x, y } = position
                    const date = mapNameToDate(map)

                    this.outputContent.Changes.push({
                        "Action": "EditData",
                        "Target": "Data/Festivals/" + date,
                        "TextOperations": [
                            {
                                "Operation": "Append",
                                "Target": [
                                    "Entries",
                                    "Set-Up_additionalCharacters"
                                ],
                                "Value": `${name} ${x} ${y} ${spot.direction}`,
                                "Delimiter": "/"
                            }
                        ]
                    })
                }
            }

            if (content.shops) {
                for (const shop of content.shops) {
                    let portraitpath: string | null = null
                    if (shop.portraits) {
                        portraitpath = `Portraits/${uid}_${shop.id}`
                        
                        this.outputContent.Changes.push({
                            "Action": "Load",
                            "FromFile": shop["portraits"][0],
                            "Target": portraitpath,
                        })
                    }

                    this.outputContent.Changes.push({
                        "Action": "EditData",
                        "Target": "Data/Shops",
                        "Entries": {
                            [shop.id]: {
                                "Items": [
                                    shop['inventory'].map((item: any) => {
                                        if (!item.index) logOutput(`${item.name} (${item.type}) will fail due to being a custom item.`)
                                        return {
                                            Price: item.price ?? item.Price,
                                            TradeItemId: inventoryTypeToQualified(item.type) + item.index,
                                            AvailableStock: shop.stock ?? -1
                                        }
                                    })
                                ],
                                "Owners": [
                                    {
                                        "Name": shop.id,
                                        "Id": shop.id,
                                        "Portrait": portraitpath,
                                    }
                                ]
                            }
                        }
                    })
                }
            }

            if (content.addMaps) {
                for (const map of content.addMaps) {
                    const mapname = map.name

                    customMapNames.push(mapname)

                    this.outputContent.Changes.push({
                        Action: 'Load',
                        Target: `Maps/Custom_${mapname}`,
                        FromFile: `assets/${map.file.replace(/tbin$/, 'tmx')}`
                    })

                    this.outputContent.Changes.push({
                        Action: 'EditData',
                        Target: 'Data/Locations',
                        Entries: {
                            [`Custom_${mapname}`]: {
                                DisplayName: `Custom_${mapname}`,
                                DefaultArrivalTile: [0, 0],
                                CreateOnLoad: {
                                    MapMath: `Maps/Custom_${mapname}`,
                                },
                                FormerLocationNames: [ mapname ]
                            }
                        }
                    })

                    if (map.addWarps) {
                        const warps = {
                            Action: 'EditMap',
                            Target: `Maps/Custom_${mapname}`,
                            addWarps: [] as string[],
                        }

                        for (let warp of map.addWarps) {
                            const split = warp.split(' ')
                            if (customMapNames.includes(split[2])) split[2] = `Custom_${split[2]}`

                            warps.addWarps.push(split.join(' '))
                        }

                        this.outputContent.Changes.push(warps)
                    }
                }
            }

            if (content.onlyWarps) {
                for (const map of content.onlyWarps) {
                    const warps = {
                        Action: 'EditMap',
                        Target: `Maps/${customMapNames.includes(map.name) ? 'Custom_' : ''}${map.name}`,
                        addWarps: [] as string[],
                    }

                    for (let warp of map.addWarps) {
                        const split = warp.split(' ')
                        if (customMapNames.includes(split[2])) split[2] = `Custom_${split[2]}`

                        warps.addWarps.push(split.join(' '))
                    }

                    this.outputContent.Changes.push(warps)
                }
            }

            if (content.spouseRooms) {
                for (const spouseRoom of content.spouseRooms) {
                    const mn = `${uid}_${spouseRoom.name}_room`

                    this.outputContent.Changes.push({
                        Action: 'EditData',
                        Target: 'Data/Characters',
                        TargetField: [
                            "Entries",
                            spouseRoom.name,
                        ],
                        Fields: {
                            SpouseRoom: {
                                MapAsset: mn,
                                MapSourceRect: {
                                    X: 0,
                                    Y: 0,
                                    Width: 6,
                                    Height: 9,
                                }
                            }
                        }
                    })

                    this.outputContent.Changes.push({
                        Action: 'Load',
                        Target: `Maps/${mn}`,
                        FromFile: spouseRoom.file
                    })
                }
            }

            const tbinInstances = new Map<string, tBIN>()

            for (const file of this.files) {
                if (file.name.endsWith('.tbin')) {
                    try {
                        const buf = await file.arrayBuffer()
                        logOutput(`Converting tbin ${file.name}`)
                        console.log(file)
                        
                        const tbin = new tBIN()
                        
                        console.log('tbin', file.name, tbin, buf, Array.from(new Uint8Array(buf.slice(0, 4))).map(e => '0x' + e.toString(16)))
                        const bytes = new Uint8Array(buf)
                        const s_tmx = await getTmxFromTbin(bytes)
                        
                        const tmx = new File([new Blob([s_tmx], { type: "" })],
                            file.name.replace(/tbin$/, 'tmx'), {
                                lastModified: Date.now(),
                                type: "",
                        //@ts-ignore

                                webkitRelativePath: file.webkitRelativePath.replace(/tbin$/, 'tmx')
                            })

                        // @ts-ignore
                        tmx._path = file.webkitRelativePath.replace(/tbin$/, 'tmx')
                            console.log('tmx', tmx)
                        this.files.push(tmx)
                        tbinInstances.set(file.name, tbin)
                    } catch (e) {
                        logOutput(`Failed to convert ${file.name} to TMX`)
                        console.warn(file.name, e)
                    }
                }
            }

            const zip = new JSZip()
            const folderName = this.files.find(x => x.name == 'manifest.json')!.webkitRelativePath.split('/')[0].replace('[BFAV]', '[CP]')
            
            zip.file<'string'>(`${folderName}/content.json`, JSON.stringify(this.outputContent, null, 4))
            zip.file<'string'>(`${folderName}/manifest.json`, JSON.stringify(this.outputManifest, null, 4))

            for (const file of this.files.filter(x => x.name != 'content.json' && x.name != 'manifest.json')) {
                const buf = await file.arrayBuffer()
                console.log(file, buf, file.webkitRelativePath || (file as any)._path)
                //@ts-ignore
                zip.file<'arraybuffer'>((file.webkitRelativePath || file._path).replace('[BFAV]', '[CP]'), buf)
                // console.log(path, folderName, buf)
            }

            const exported = await zip.generateAsync({
                type: 'base64',
            })

            logOutput('Converted ' + this.manifest.Name)

            resolve('data:application/zip;base64,' + exported)
        })
    }
}