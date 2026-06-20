import type { Manifest } from "$lib/types"
import { converterOutputLog, logOutput } from "../../stores";
import { catchAndNotify } from "../../util"
import JSON5 from 'json5'
import JSZip from 'jszip';
import BaseConverter from "./base";
import * as XNB from 'xnb'

interface Asset {
    animal: string;
    trueAnimal: string;
    path: string;
    target_path?: string;
    id: string;
}

const addTbinIfNeeded = (s: string) => s + (s.endsWith('.tbin') ? '.tbin' : '')

const HOUSE_LAYOUTS_PROPS = [
    // # Standard - 0
    {
        'FarmHouseFlooring': '0',
        'FarmHouseWallpaper': '0',
        'FarmHouseStarterSeedsPosition': '3 7',
        'FarmHouseFurniture': ''
    },
    // # Riverland - 1
    {
        'FarmHouseFlooring': '1',
        'FarmHouseWallpaper': '11',
        'FarmHouseStarterSeedsPosition': '4 7',
        'FarmHouseFurniture': ''
    },
    // # Forest - 2
    {
        'FarmHouseFlooring': '34',
        'FarmHouseWallpaper': '92',
        'FarmHouseStarterSeedsPosition': '4 7',
        'FarmHouseFurniture': ''
    },
    // # Hill Top - 3 
    {
        'FarmHouseFlooring': '18',
        'FarmHouseWallpaper': '12',
        'FarmHouseStarterSeedsPosition': '2 9',
        'FarmHouseFurniture': ''
    },
    // # Wilderness - 4
    {
        'FarmHouseFlooring': '4',
        'FarmHouseWallpaper': '95',
        'FarmHouseStarterSeedsPosition': '4 7',
        'FarmHouseFurniture': ''
    },
    // # MTN doesn't support Four Corners/Beach/Meadowlands
]

export default class MTN2CP extends BaseConverter {
    constructor(public manifest: Manifest, public files: File[]) {
        super(manifest, files, 'sgtpickles.mtn', 'Pathoschild.ContentPatcher', 'MTN2CP')
    }

    convert() {
        return new Promise<string | null>(async resolve => {
            const uid = this.manifest.UniqueID

            const contentFile = this.files.find(x => x.name == 'farmType.json')
            if (!contentFile) return null

            const farmType: any | null | undefined = await catchAndNotify(
                async () => JSON5.parse((await contentFile.text())),
            'Unreadable content.json selected!') as any | null | undefined
            if (!farmType) return null
    
            const farmID = `${uid}.${farmType['ID']}`
            const farmMapsFileName = `Mod_Farm_${farmType['farmMapFile']}`

            this.outputContent['Changes'].push({
                "LogName": "load in map file for farm",
                "Action": "Load",
                "Target": "Maps/" + farmMapsFileName,
                "FromFile": addTbinIfNeeded(farmType['farmMapFile'])
            })

            const iconSourcePath = farmType['Icon']
            const iconContentPath = `LooseSprites/Mod_Farm_Icon_${this.manifest['UniqueID']}`

            if (iconSourcePath) this.outputContent['Changes'].push({
                "LogName": "load in icon for farm",
                "Action": "Load",
                "Target": iconContentPath,
                "FromFile": iconSourcePath,
            })

            this.outputContent['Changes'].push({
                "LogName": "Load in UI Strings",
                "Action": "EditData",
                "Target": "Strings/UI",
                "Entries": {
                    [`${this.manifest['UniqueID']}_Farm_Description`]: farmType['Description']
                },
            })

            this.outputContent['Changes'].push({
                "LogName": "Set up custom farm type",
                "Action": "EditData",
                "Target": "Data/AdditionalFarms",
                "Entries": {
                    farmID: {
                        "ID": farmID,
                        "TooltipStringPath": `Strings/UI:${this.manifest['UniqueID']}_Farm_Description`,
                        "MapName": farmMapsFileName,
                        "IconTexture": iconSourcePath ? iconContentPath : null,
                        "SpawnMonstersByDefault": farmType['spawnMonstersAtNight'] ?? false,
                    }
                },
            })

            if (farmType?.farmHouse?.pointOfInteraction) {
                const house = farmType['farmHouse']['pointOfInteraction']
                const fp = 'Maps/' + farmMapsFileName
                
                this.outputContent['Changes'].push({
                    "LogName": "set up farmhouse location for farm",
                    "Action": "EditMap",
                    "Target": fp,
                    "MapProperties": {
                        "FarmHouseEntry": `${house['x']} ${house['y']}`
                    }
                })
            }
           
            if (farmType?.grandpaShrine?.pointOfInteraction) {
                const shrine = farmType['grandpaShrine']['pointOfInteraction']
                const fp = 'Maps/' + farmMapsFileName
                
                this.outputContent['Changes'].push({
                    "LogName": "set up grandpaShrine location for farm",
                    "Action": "EditMap",
                    "Target": fp,
                    "MapProperties": {
                        "GrandpaShrineLocation": `${shrine['x']} ${shrine['y']}`
                    }
                })
            }
            
            if (farmType?.greenHouse?.coordinates) {
                const greenhouse = farmType['greenHouse']['coordinates']
                const fp = 'Maps/' + farmMapsFileName
                
                this.outputContent['Changes'].push({
                    "LogName": "set up greenHouse location for farm",
                    "Action": "EditMap",
                    "Target": fp,
                    "MapProperties": {
                        "GreenhouseLocation": `${greenhouse['x']} ${greenhouse['y'] + 4}`
                    }
                })
            }

            if (farmType?.mailBox?.pointOfInteraction) {
                const box = farmType['mailBox']['pointOfInteraction']
                const fp = 'Maps/' + farmMapsFileName
                
                this.outputContent['Changes'].push({
                    "LogName": "set up mailBox location for farm",
                    "Action": "EditMap",
                    "Target": fp,
                    "MapProperties": {
                        "MailboxLocation": `${box['x']} ${box['y']}`
                    }
                })
            }
            
            if (farmType?.farmCave?.pointOfInteraction) {
                const cave = farmType['farmCave']['pointOfInteraction']
                const fp = 'Maps/' + farmMapsFileName
                
                this.outputContent['Changes'].push({
                    "LogName": "set up farmCave location for farm",
                    "Action": "EditMap",
                    "Target": fp,
                    "MapProperties": {
                        "FarmCaveEntry": `${cave['x']} ${cave['y']}`
                    }
                })
            }
            
            if (farmType?.petWaterBowl?.pointOfInteraction) {
                const cave = farmType['petWaterBowl']['pointOfInteraction']
                const fp = 'Maps/' + farmMapsFileName
                
                this.outputContent['Changes'].push({
                    "LogName": "set up petWaterBowl location for farm",
                    "Action": "EditMap",
                    "Target": fp,
                    "MapProperties": {
                        "PetBowlLocation": `${cave['x']} ${cave['y']}`
                    }
                })
            }
            
            if (farmType?.rabbitStatue?.pointOfInteraction) {
                const rabbit = farmType['rabbitStatue']['pointOfInteraction']
                const fp = 'Maps/' + farmMapsFileName
                
                this.outputContent['Changes'].push({
                    "LogName": "set up rabbitStatue/warp totem entry location for farm",
                    "Action": "EditMap",
                    "Target": fp,
                    "MapProperties": {
                        "WarpTotemEntry": `${rabbit['x']} ${rabbit['y']}`
                    }
                })
            }

            if (farmType?.shippingBin?.pointOfInteraction) {
                const bin = farmType['shippingBin']['pointOfInteraction']
                const fp = 'Maps/' + farmMapsFileName
                const {x, y} = bin

                this.outputContent['Changes'].push({
                    "LogName": "set up shippingBin location for farm",
                    "Action": "EditMap",
                    "Target": fp,
                    "MapProperties": {
                        "ShippingBinLocation": `${x} ${y + 1}`
                    }
                })

                const buildings = [
                    [x, y],
                    [x + 1, y],
                    [x + 1, y + 1],
                    [x, y + 1],
                ]

                const tilePatch = {
                    "Action": "EditMap",
                    "Target": fp,
                    "MapTiles": [] as any[]
                }

                for (const tile of buildings) {
                    const mt = {
                        "Position": { "X": tile[0], "Y": tile[1]},
                        "Layer": "Buildings",
                        "Remove": true,
                    }
                    tilePatch['MapTiles'].push(mt)
                }
                this.outputContent.Changes.push(tilePatch)
            }

            for (const map of farmType['neighboringMaps'] ?? []) {
                const name = map['MapName']
                if (!['Forest', 'BusStop', 'Backwoods'].includes(name)) {
                    logOutput(`${name} does not need migrating, skipping...`)
                    continue
                }
                if (!map.warpPoints) {
                    logOutput(`No warp points found for ${name}, skipping...`)
                    continue

                }

                let toX = null
                let toY = null

                for (const warp of map['warpPoints']) {
                    if (!toX)
                        toX = warp['toX']
                    else if (toX != warp['toX'])
                        logOutput(`Warppoints for ${name} has multiple X axis destinations on farm. Using first.`)
                    
                    if (!toY)
                        toY = warp['toY']
                    else if (toY != warp['toY'])
                        logOutput(`Warppoints for ${name} has multiple Y axis destinations on farm. Using first.`)
                }
                    
                let property = null
                if (name == 'Forest')
                    property = 'ForestEntry'
                else if (name == 'BusStop')
                    property = 'BusStopEntry'
                else if (name == 'Backwoods')
                    property = 'BackwoodsEntry'
                
                this.outputContent['Changes'].push({
                    "LogName": `set up ${name} entrance for farm`,
                    "Action": "EditMap",
                    "Target": "Maps/" + farmMapsFileName,
                    "MapProperties": {
                        [property ?? '_mtn2cp_failed']: `${toX} ${toY}`
                    }
                })
            }

            if (farmType['furnitureLayoutFromCanon']) {
                const id = farmType['furnitureLayoutFromCanon']
                const props = HOUSE_LAYOUTS_PROPS[id]
                logOutput('Farmhouse furniture layout **will not work**.')
                this.outputContent['Changes'].push({
                    "LogName": `set up farmhouse design/layout entrance for farm`,
                    "Action": "EditMap",
                    "Target": "Maps/" + farmMapsFileName,
                    "MapProperties": props
                })
            }


            const zip = new JSZip()
            const folderName = this.files.find(x => x.name == 'manifest.json')!.webkitRelativePath.split('/')[0].replace('[MTN]', '[CP]')
            
            zip.file<'string'>(`${folderName}/content.json`, JSON.stringify(this.outputContent, null, 4))
            zip.file<'string'>(`${folderName}/manifest.json`, JSON.stringify(this.outputManifest, null, 4))

            for (const file of this.files.filter(x => x.name != 'farmType.json' && x.name != 'manifest.json')) {
                
                const buf = await file.arrayBuffer()
                zip.file<'arraybuffer'>(file.webkitRelativePath.replace('[MTN]', '[CP]'), buf)
                // logOutput(path, folderName, buf)
            }

            for (const file of this.files.filter(x => x.name.endsWith('.xnb'))) {
                const unpacked = await XNB.unpackToContent(file) // it's all native js :(
                if (unpacked.type == 'TBin') {
                    zip.file<'blob'>(file.webkitRelativePath.replace('[MTN]', '[CP]').replace(/xnb$/, 'tbin'),
                        unpacked.content)
                }
            }

            const exported = await zip.generateAsync({
                type: 'base64',
            })

            logOutput('Converted ' + this.manifest.Name)

            resolve('data:application/zip;base64,' + exported)
        })
    }
}