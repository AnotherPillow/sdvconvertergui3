import type { Manifest } from "$lib/types"
import { converterOutputLog, logOutput } from "../../stores";
import { catchAndNotify } from "../../util"
import JSON5 from 'json5'
import JSZip from 'jszip';
import BaseConverter from "./base";

interface Asset {
    animal: string;
    trueAnimal: string;
    path: string;
    target_path?: string;
    id: string;
}

const splitAnimalString = (data: string) => {
    const _parts = data.split('/')

    return {
        'daysToProduce': _parts[0],
        'daysToMature': _parts[1],
        'defaultProduceIndex': _parts[2],
        'deluxeProduceIndex': _parts[3],
        'sound': _parts[4],
        '_frontBackBounding': _parts.slice(5,10),
        '_sideBounding': _parts.slice(9, 13),
        'harvestType': Number(_parts[13]),
        'changeTextureWhenItemReady': _parts[14] == 'true',
        'buildingType': _parts[15],
        'frontBackSpriteSize': _parts.slice(16,18),
        'sideSpriteSize': _parts.slice(18,20),
        'fullnessDrain': _parts[20],
        'happinessDrain': _parts[21],
        'harvestTool': _parts[22],
        'meatIndex': _parts[23],
        'sellPrice': _parts[24],
        'displayType': _parts[25],
        'displayBuilding': _parts[26],
    }
}

export default class BFAV2CP extends BaseConverter {
    constructor(public manifest: Manifest, public files: File[]) {
        super(manifest, files, 'paritee.betterfarmanimalvariety', 'Pathoschild.ContentPatcher', 'BFAV2CP')
    }

    convert() {
        return new Promise<string | null>(async resolve => {
            const assets: Asset[] = []
            const uid = this.manifest.UniqueID

            const contentFile = this.files.find(x => x.name == 'content.json')
            if (!contentFile) return null

            const content: any | null | undefined = await catchAndNotify(
                async () => JSON5.parse((await contentFile.text())),
            'Unreadable content.json selected!') as any | null | undefined
            if (!content || !content.Categories) return null
    
            for (const animal of content.Categories) {
                const shop = animal.AnimalShop
                if (shop) {
                    assets.push({
                        "animal": animal['Category'],
                        "trueAnimal": animal['Category'],
                        "path": shop['Icon'],
                        "target_path": `Animals/${uid}-${animal["Category"]} Icon`,
                        "id": "shopIcon"
                    })
                } else {
                    console.warn(`${animal["Category"]} is not purchasable, will not be obtainable without external means.`)
                }

                for (const type of animal['Types']) {
                    assets.push({
                        "animal": type['Type'],
                        "trueAnimal": animal['Category'],
                        "path": type['Sprites']['Adult'],
                        "id": "adultSprite",
                    })
                    
                    if (type['Sprites']['Baby']) assets.push({
                        "animal": type['Type'],
                        "trueAnimal": animal['Category'],
                        "path": type['Sprites']['Baby'],
                        "id": "babySprite",
                    })

                    if (shop) assets.push({
                        "animal": type['Type'],
                        "trueAnimal": animal['Category'],
                        "path": shop['Icon'],
                        "target_path": `Animals/${uid}-${animal["Category"]}.${type["Type"]} Icon`,
                        "id": "shopIcon"
                    })

                    if (type['Sprites']['ReadyForHarvest']) assets.push({
                        "animal": type['Type'],
                        "trueAnimal": animal['Category'],
                        "path": type['Sprites']['ReadyForHarvest'],
                        "id": "harvestSprite"
                    })

                    const parsed = splitAnimalString(type['Data'])

                    const newAnimal = {
                        'key': type['Type'],
                        'value': {
                            'DisplayName': parsed['displayType'],
                            'House': parsed['buildingType'],
                            'Gender': 'MaleOrFemale',
                            'PurchasePrice': shop.Price ?? 1,
                            'ShopTexture': `Animals/${uid}-${type["Type"]} Icon`,
                            'ShopSourceRect': {
                                'X': 0,
                                'Y': 0,
                                'Width': 32,
                                'Height': 16,
                            },
                            'RequiredBuilding': parsed['buildingType'],
                            'ShopDisplayName': parsed['displayType'],
                            'ShopDescription': shop.Description ?? 'This animal is not purchasable.',
                            'DaysToMature': parsed['daysToMature'],
                            'ProduceItemIds': [
                                {
                                    'Id': 'Default',
                                    'Condition': null,
                                    'MinimumFriendship': 0,
                                    'ItemId': parsed['defaultProduceIndex']
                                }
                            ],
                            'DeluxeProduceItemIds': [
                                {
                                    'Id': 'Default',
                                    'Condition': null,
                                    'MinimumFriendship': 0,
                                    'ItemId': parsed['deluxeProduceIndex']
                                }
                            ],
                            'DaysToProduce': parsed['daysToProduce'],
                            'HarvestType': [
                                'DropOvernight',
                                'HarvestWithTool',
                                null
                            ][parsed['harvestType']],
                            'HarvestTool': parsed['harvestTool'],
                            'Sound': parsed['sound'],
                            'BabySound': parsed['sound'],
                            'Texture': `Animals/${uid}-${type["Type"]}`,
                            'HarvestedTexture': `Animals/${uid}-${type["Type"]} Harvested`,
                            'BabyTexture': type['Sprites']['Baby'] ? `Animals/${uid}-${type["Type"]} Baby` : null,
                            'SpriteWidth': parsed['frontBackSpriteSize'][0],
                            'SpriteHeight': parsed['frontBackSpriteSize'][1],
                            // 'Skins': 'TODO: make skins use types, not seperate animals',
                            'ShowInSummitCredits': true, // this is on because yes.
                        }
                    }

                    this.outputContent['Changes'].push({
                        'LogName': `Load data for ${animal["Category"]} (${type["Type"]})`,
                        'Action': 'EditData',
                        'Target': 'Data/FarmAnimals',
                        'Entries': {
                            [newAnimal['key']]: newAnimal['value']
                        }
                    })

                }
            }

            for (const asset of assets) {
                logOutput(`processing asset ${JSON.stringify(asset)}`)
                switch (asset.id) {
                    case 'adultSprite':
                        this.outputContent['Changes'].push({
                            'LogName': `Load ${asset.id} for ${asset["animal"]}`,
                            'Action': 'Load',
                            'Target': `Animals/${uid}-${asset["animal"]}`,
                            'FromFile': asset['path']
                        })
                        break;
                    case 'babySprite':
                        this.outputContent['Changes'].push({
                            'LogName': `Load ${asset.id} for ${asset["animal"]}`,
                            'Action': 'Load',
                            'Target': `Animals/${uid}-${asset["animal"]} Baby`,
                            'FromFile': asset['path']
                        })
                        break;
                    case 'harvestsprite':
                        this.outputContent['Changes'].push({
                            'LogName': `Load ${asset.id} for ${asset["animal"]}`,
                            'Action': 'Load',
                            'Target': `Animals/${uid}-${asset["animal"]} Harvested`,
                            'FromFile': asset['path']
                        })
                        break;
                    case 'shopIcon':
                        this.outputContent['Changes'].push({
                            'LogName': `Load ${asset.id} for ${asset["animal"]}`,
                            'Action': 'Load',
                            'Target': asset.target_path,
                            'FromFile': asset['path']
                        })
                        break;
                    
                    default: break;
                }
            }

            const zip = new JSZip()
            const folderName = this.files.find(x => x.name == 'manifest.json')!.webkitRelativePath.split('/')[0].replace('[BFAV]', '[CP]')
            
            zip.file<'string'>(`${folderName}/content.json`, JSON.stringify(this.outputContent, null, 4))
            zip.file<'string'>(`${folderName}/manifest.json`, JSON.stringify(this.outputManifest, null, 4))

            for (const file of this.files.filter(x => x.name != 'content.json' && x.name != 'manifest.json')) {
                
                const buf = await file.arrayBuffer()
                zip.file<'arraybuffer'>(file.webkitRelativePath.replace('[BFAV]', '[CP]'), buf)
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