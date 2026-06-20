import type { Manifest } from "$lib/types"
import { converterOutputLog, logOutput } from "../../stores";
import { catchAndNotify } from "../../util"
import JSON5 from 'json5'
import JSZip from 'jszip';
import BaseConverter from "./base";

function inventoryTypeToQualified(type: any) {
    switch (type) {
        case 'Object':
            return '(O)'
        case 'MeleeWeapon':
            return '(W)'
        case 'Weapon':
            return '(W)'
        case 'Wallpaper':
            return '(WP)'
        case 'Furniture':
            return '(F)'
        case 'BigCraftable':
            return '(BC)'
        default:
            return ''
    }
}


function capitalise(string: string): string {
    return string[0].toUpperCase() + string.slice(1);
}

// conversion of preconditiontogsq to ts

function preconditiontogsq(precondition: string): string {
    const gsqs: string[] = [];
    const preconditions = precondition.split("/");

    for (const precondition of preconditions) {
        const parts = precondition.split(" ");
        const type = parts[0];
        const args = parts.slice(1);
        const stringArgs = args.join(" ");

        switch (type) {
            case "A":
                gsqs.push(`!PLAYER_HAS_CONVERSATION_TOPIC Current ${args}`);
                break;
            case "F":
                gsqs.push(`!IS_FESTIVAL_DAY `);
                break;
            case "U": {
                const n = parseInt(args[0]);
                for (let i = 0; i <= n; i++) {
                    gsqs.push(`!IS_FESTIVAL_DAY ${i}`);
                }
                break;
            }
            case "d":
                gsqs.push(`!DAY_OF_WEEK ${stringArgs}`);
                break;
            case "r":
                gsqs.push(`RANDOM ${args[0]}`);
                break;
            case "v":
                // TODO
                break;
            case "w":
                gsqs.push(`WEATHER TARGET ${stringArgs}`);
                break;
            case "y": {
                const year = parseInt(args[0]);
                if (year === 1) {
                    gsqs.push(`YEAR 1 1`);
                } else {
                    gsqs.push(`YEAR ${year}`);
                }
                break;
            }
            case "z":
                gsqs.push(`!SEASON ${stringArgs}`);
                break;
            case "N":
                gsqs.push(`WORLD_STATE_FIELD GoldenWalnutsFound ${stringArgs}`);
                break;
            case "B":
                // TODO
                break;
            case "D":
                gsqs.push(`PLAYER_IS_DATING Current ${stringArgs}`);
                break;
            case "J":
                gsqs.push(`IS_JOJA_MART_COMPLETE`);
                break;
            case "L":
                // TODO
                break;
            case "M":
                gsqs.push(`PLAYER_MONEY_EARNED Current ${stringArgs}`);
                break;
            case "O":
                gsqs.push(`PLAYER_IS_MARRIED Current ${stringArgs}`);
                break;
            case "S":
                gsqs.push(`PLAYER_HAS_SECRET_NOTE Current ${stringArgs}`);
                break;
            case "a":
                // TODO
                break;
            case "b":
                // TODO: intended purpose is "Current player has reached the bottom floor of the Mines at least that many times" 
                // but this only checks reaching the bottom at all
                gsqs.push(`MINE_LOWEST_LEVEL_REACHED 120`);
                break;
            case "c":
                // TODO
                break;
            case "e":
            case "k": {
                const x = type === "e" ? "" : "!";
                if (args.length === 1) {
                    if (args[0].includes("/")) {
                        for (const id of args[0].split("/")) {
                            gsqs.push(`${x}PLAYER_HAS_SEEN_EVENT Current ${id}`);
                        }
                    } else {
                        gsqs.push(`${x}PLAYER_HAS_SEEN_EVENT Current ${stringArgs}`);
                    }
                } else {
                    const tempGsqs = args.map(id => `${x}PLAYER_HAS_SEEN_EVENT Current ${id}`);
                    gsqs.push(`ANY "${tempGsqs.join('" "')}"`);
                }
                break;
            }
            case "g":
                gsqs.push(`PLAYER_GENDER Current ${capitalise(stringArgs)}`);
                break;
            case "h":
                gsqs.push(`!PLAYER_HAS_PET Current`);
                gsqs.push(`PLAYER_PREFERRED_PET Current ${capitalise(stringArgs)}`);
                break;
            case "i":
                gsqs.push(`PLAYER_HAS_ITEM Current (O)${stringArgs}`);
                break;
            case "j":
                gsqs.push(`PLAYER_STAT Current daysPlayed`);
                break;
            case "l":
                gsqs.push(`!PLAYER_HAS_FLAG Current ${stringArgs}`);
                break;
            case "m":
                gsqs.push(`PLAYER_MONEY_EARNED Current ${stringArgs}`);
                break;
            case "n":
                gsqs.push(`PLAYER_HAS_FLAG Current ${stringArgs}`);
                break;
            case "o":
                gsqs.push(`!PLAYER_IS_MARRIED Current ${stringArgs}`);
                break;
            case "p":
                // TODO
                break;
            case "q":
                // TODO: support for multiple IDs
                gsqs.push(`PLAYER_HAS_DIALOGUE_ANSWER Current ${stringArgs}`);
                break;
            case "s":
                gsqs.push(
                    `PLAYER_SHIPPED_BASIC_ITEM Current (O)${args[0]} ${args[1]}`
                );
                break;
            case "t":
                gsqs.push(`TIME ${stringArgs}`);
                break;
            case "u":
                // TODO: figure out how multiple days work
                break;
            case "x":
                // Cannot be done in GSQs
                break;
            case "C":
                gsqs.push(
                    `ANY "IS_COMMUNITY_CENTER_COMPLETE" "IS_JOJA_MART_COMPLETE"`
                );
                break;
            case "X":
                gsqs.push(`ANY "!IS_COMMUNITY_CENTER_COMPLETE" "!IS_JOJA_MART_COMPLETE"`);
                break;
            case "H":
                gsqs.push(`IS_HOST`);
                break;
            case "Hl":
                gsqs.push(`!PLAYER_HAS_FLAG Host ${stringArgs}`);
                break;
            case "Hn":
                gsqs.push(`PLAYER_HAS_FLAG Host ${stringArgs}`);
                break;
            case "*l":
                gsqs.push(`!PLAYER_HAS_FLAG Host ${stringArgs}`);
                gsqs.push(`!PLAYER_HAS_FLAG Current ${stringArgs}`);
                break;
            case "*n":
                gsqs.push(`PLAYER_HAS_FLAG Host ${stringArgs}`);
                gsqs.push(`PLAYER_HAS_FLAG Current ${stringArgs}`);
                break;
        }
    }

    return gsqs.join(", ");
}

export default class STF2CP extends BaseConverter {
    constructor(public manifest: Manifest, public files: File[]) {
        super(manifest, files, 'cherry.shoptileframework', 'Pathoschild.ContentPatcher', 'STF2CP')
    }

    convert() {
        return new Promise<string | null>(async resolve => {
            const uid = this.manifest.UniqueID

            const shopsFile = this.files.find(x => x.name == 'shops.json')
            if (!shopsFile) return null

            const shops: any | null | undefined = await catchAndNotify(async () => JSON5.parse((await shopsFile.text())), 'Unreadable shops.json selected!') as any | null | undefined
            if (!shops) return null

            if (shops.AnimalShops)
                logOutput(`WARN: AnimalsShop(s) (${shops.AnimalShops.map((x: any) => x.ShopName).join(', ')}) found in shops.json, will be ignored.`)
            
            for (const shop of shops.Shops) {
                const shopID = `${uid}_${shop.ShopName}`
                
                let gsq = null
                let portrait = null

                if (shop.When) {
                    gsq = ''
                    for (const w of shop.When) {
                        gsq += preconditiontogsq(w)
                    }
                }

                if (shop.PortraitPath) {
                    portrait = `Portraits/${shopID}_Portrait`
                    this.outputContent.Changes.push({
                        Action: "Load",
                        Target: portrait,
                        FromFile: shop.PortraitPath,
                    })
                }

                const shopCondition = gsq

                const _items: any[] = []
                for (let index = 0; index < shop.ItemStocks.length; index++) {
                    const _item = shop.ItemStocks[index]

                    if (!_item.ItemIDs) {
                        logOutput(`WARN: No ItemIDs found for item ${index} of ${shopID} (is it referencing by name instead?)`) // buffalo ranch for example uses names and not ids for I guess custom items
                        continue
                    }

                    const item: any = {
                        Id: `${shopID}_Item_${index}`,
                        Price: _item.StockPrice,
                        ItemId: `${inventoryTypeToQualified(_item.ItemType)}${_item.ItemIDs[0]}` // idk why there are multiple items, that's for future me to fix.
                    }
                    
                    if (_item.Stock)
                        item['AvailableStock'] = _item['Stock']

                    if (_item.When) {
                        const condition_list: any[] = []
                        for (const w of _item.When)
                            condition_list.push(preconditiontogsq(w))

                        const _condition_str = condition_list.join('" "')
                        item.Condition = `ANY "${_condition_str}"`
                    }
                    
                        
                    _items.push(item)
                }

                const change = {
                    Action: "EditData",
                    Target: "Data/Shops",
                    Entries: {
                        [shopID]: {
                            Owners: [
                                { // Closed
                                    "Condition": `!${shopCondition}`,
                                    "Portait": null,
                                    "Dialogues": null,
                                    ClosedMessage: shop.ClosedMessage ?? 'This shop is closed.',
                                    Id: `${shopID}-ClosedOwner`,
                                    Name: "AnyOrNone",
                                },
                                { // Open
                                    "Condition": shopCondition,
                                    "Portrait": portrait,
                                    Dialogues: [
                                        {
                                            Id: `${shopID}-OpenOwnerDialogue`,
                                            Dialogue: shop.Quote ?? null
                                        }
                                    ],
                                    ClosedMessage: null,
                                    Id: `${shopID}-OpenOwner`,
                                    Name: "AnyOrNone",
                                },
                            ],
                            Items: _items
                        }
                    }
                }

                this.outputContent.Changes.push(change)
                

            }
            
            const zip = new JSZip()
            const folderName = this.files.find(x => x.name == 'manifest.json')!.webkitRelativePath.split('/')[0].replace('[STF]', '[CP]')
            
            zip.file<'string'>(`${folderName}/content.json`, JSON.stringify(this.outputContent, null, 4))
            zip.file<'string'>(`${folderName}/manifest.json`, JSON.stringify(this.outputManifest, null, 4))

            for (const file of this.files.filter(x => x.name != 'content.json' && x.name != 'manifest.json' && x.name != 'shops.json')) {
                
                const buf = await file.arrayBuffer()
                zip.file<'arraybuffer'>(file.webkitRelativePath.replace('[STF]', '[CP]'), buf)
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