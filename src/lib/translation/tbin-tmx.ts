// converts tbin from casey's tbin library to a tbin.js instance and then exports to tmx

import { tBINMeta } from "$lib/external/tbin/src/parsers/metadata";
import { tBINProperties } from "$lib/external/tbin/src/parsers/properties";
import { tBINLayer, tBINStaticTile, tBINTile, tBINTiles } from "$lib/external/tbin/src/parsers/tiles";
import { tBINTileProperty, tBINTilesheet, tBINTilesheets } from "$lib/external/tbin/src/parsers/tilesheets";
import TBIN from "../extern/tbin/src/build/tbin";
import { tBIN as tBIN_js } from '../external/tbin/src/index'

export default async function getTmxFromTbin(bytes: Uint8Array, customMapNames: string[]): Promise<string> {
    const mod = await TBIN() as any

    if (!mod.FS.analyzePath("/data").exists) {
        mod.FS.mkdir("/data");
    }
    mod.FS.writeFile("/data/map.tbin", bytes);

    const mapPtr = mod.ccall("map_create", "number", [], []);

    const ok = mod.ccall(
        "map_load_file",
        "number",
        ["number", "string"],
        [mapPtr, "/data/map.tbin"]
    );
    console.log("loaded?", !!ok);

    const tbjs = new tBIN_js();
    tbjs.bytes = new Uint16Array([0])

    tbjs.meta = new tBINMeta(new Uint16Array())
    tbjs.meta.selfMapName = mod.UTF8ToString(mod.ccall(
        "map_get_id",
        "number",
        ["number"],
        [mapPtr]
    ))
    //@ts-ignore
    tbjs.meta.selfMapNameLength = tbjs.meta.selfMapName.length
    tbjs.meta.propertiesCount = mod.ccall(
        "map_prop_count",
        "number",
        ["number"],
        [mapPtr]
    )

    tbjs.properties = new tBINProperties(new Uint16Array(), 0, 0)
    const p_outCountPtr = mod._malloc(4);

    const p_listPtr = mod.ccall(
        "map_props_keys_list",
        "number",
        ["number", "number"],
        [mapPtr, p_outCountPtr]
    );

    const p_count = mod.getValue(p_outCountPtr, "i32");
    mod._free(p_outCountPtr);

    const p_keys = [];
    p_keys.length = p_count;

    // listPtr is a char**
    for (let i = 0; i < p_count; i++) {
        const strPtr = mod.getValue(p_listPtr + i * 4, "i32");
        p_keys[i] = mod.UTF8ToString(strPtr);
    }

    // free the list & strings allocated 
    mod.ccall("map_free_string_list", null, ["number", "number"], [p_listPtr, p_count]);

    for (const key of p_keys) {
        console.log(`getting value for ${key}`)
        const valPtr = mod.ccall(
            "map_prop_get_value",
            "number",
            ["number", "string"],
            [mapPtr, key]
        );

        const val = mod.UTF8ToString(valPtr);
        tbjs.properties.set(key,val)
        console.log(`property ${key}->${val}`)
    }

    
    tbjs.tilesheets = new tBINTilesheets(new Uint16Array([0]), 0)
    tbjs.tilesheets.tilesheetCount = mod.ccall(
        "map_tilesheets_count",
        "number",
        ["number"],
        [mapPtr]
    )
    
    try {
        for (let i = 0; i < tbjs.tilesheets.tilesheetCount; i++) {
            function getValue<T = string>(func: string, ret = 'number', argtypes = ['number', 'number'], argvals = [mapPtr, i], wrapper = mod.UTF8ToString): T {
                return wrapper(mod.ccall(
                    func,
                    ret,
                    argtypes,
                    argvals,
                ))
            }
            
            const displayname = getValue("map_tilesheets_get_name")
            const filename = getValue("map_tilesheets_get_image")

            // const props_count = getValue<number>("map_tilesheets_get_image", 'number', ['number'], [mapPtr], (v: any) => v)

            const t_outCountPtr = mod._malloc(4);

            const t_listPtr = mod.ccall(
                "map_tilesheet_prop_keys_list",
                "number",
                ["number", "number", "number"],
                [mapPtr, t_outCountPtr, i]
            );

            const t_count = mod.getValue(t_outCountPtr, "i32");
            mod._free(t_outCountPtr);

            const t_keys = [];
            t_keys.length = t_count;

            // listPtr is a char**
            for (let j = 0; j < t_count; j++) {
                const strPtr = mod.getValue(t_listPtr + j * 4, "i32");
                t_keys[j] = mod.UTF8ToString(strPtr);
            }

            // free the list & strings allocated 
            mod.ccall("map_free_string_list", null, ["number", "number"], [t_listPtr, t_count]);

            const tileProperties: tBINTileProperty[] = []

            for (const key of t_keys) {
                console.log(`getting value for tilesheet ${key}`)
                const valPtr = mod.ccall(
                    "map_tilesheet_prop_get_value",
                    "number",
                    ["number", "string", "number"],
                    [mapPtr, key, i]
                );

                const val = mod.UTF8ToString(valPtr);
                console.log(`making a tile prop object with ${key}=${val}`)
                const prop = new tBINTileProperty(key, val, 'string')
                tileProperties.push(prop)
                console.log(`property ${key}->${val}`)
            }

            const tileHeight = mod.ccall(
                "map_tilesheets_tile_y",
                "number",
                ["number", "number"],
                [mapPtr, i]
            )
            
            const tileWidth = mod.ccall(
                "map_tilesheets_tile_x",
                "number",
                ["number", "number"],
                [mapPtr, i]
            )

            const sheetTilesWidth = mod.ccall(
                "map_tilesheets_image_tiles_x",
                "number",
                ["number", "number"],
                [mapPtr, i]
            )
            
            const sheetTilesHeight = mod.ccall(
                "map_tilesheets_image_tiles_y",
                "number",
                ["number", "number"],
                [mapPtr, i]
            ) 

            const sheet = new tBINTilesheet(displayname, filename, tileProperties, tileHeight, tileWidth, sheetTilesWidth * 16, sheetTilesHeight * 16);

            tbjs.tilesheets.tilesheets.push(sheet)
        }
    } catch (e) {
        console.warn(`failed creating a tilesheet(s) with`, e)
    }

    tbjs.tiles = new tBINTiles(new Uint16Array([0]), 0)
    tbjs.tiles.tileLayerCount = mod.ccall(
        "map_layers_count",
        "number",
        ["number"],
        [mapPtr]
    )
    

    for (let i = 0; i < tbjs.tiles.tileLayerCount; i++) {
        try {
            function getValue<T = string>(func: string, ret = 'number', argtypes = ['number', 'number'], argvals = [mapPtr, i], wrapper = mod.UTF8ToString): T {
                return wrapper(mod.ccall(
                    func,
                    ret,
                    argtypes,
                    argvals,
                ))
            }
            const name = getValue('map_layer_get_name')
            const widthTiles = mod.ccall(
                "map_layer_get_tile_width",
                "number",
                ["number", "number"],
                [mapPtr, i]
            )
            const heightTiles = mod.ccall(
                "map_layer_get_tile_height",
                "number",
                ["number", "number"],
                [mapPtr, i]
            )
            // returns 0 or 1 (false or true)
            const visible = 1 == mod.ccall(
                "map_layer_get_visiblity",
                "number",
                ["number", "number"],
                [mapPtr, i]
            )

            const tileWidthPixels = mod.ccall(
                "map_layer_get_tile_width_px_x",
                "number",
                ["number", "number"],
                [mapPtr, i]
            )
            const tileHeightPixels = mod.ccall(
                "map_layer_get_tile_width_px_y",
                "number",
                ["number", "number"],
                [mapPtr, i]
            )

            const layer = new tBINLayer(name, widthTiles, heightTiles, visible, tileWidthPixels, tileHeightPixels)

            /// AAAAAAAAAAAAAAA
            const l_outCountPtr = mod._malloc(4);

            const l_listPtr = mod.ccall(
                "map_layer_prop_keys_list",
                "number",
                ["number", "number", "number"],
                [mapPtr, l_outCountPtr, i]
            );

            const l_count = mod.getValue(l_outCountPtr, "i32");
            mod._free(l_outCountPtr);

            const l_keys = [];
            l_keys.length = l_count;

            // listPtr is a char**
            for (let j = 0; j < l_count; j++) {
                const strPtr = mod.getValue(l_listPtr + j * 4, "i32");
                l_keys[j] = mod.UTF8ToString(strPtr);
            }

            // free the list & strings allocated 
            mod.ccall("map_free_string_list", null, ["number", "number"], [l_listPtr, l_count]);

            const layerProperties: Map<string, boolean | number | string> = new Map()

            for (const key of l_keys) {
                console.log(`getting value for layer ${key}`)
                const valPtr = mod.ccall(
                    "map_layer_prop_get_value",
                    "number",
                    ["number", "string", "number"],
                    [mapPtr, key, i]
                );

                const val = mod.UTF8ToString(valPtr);
                console.log(`layer prop with ${key}=${val}`)
                layerProperties.set(key, val)
                console.log(`layer property ${key}->${val}`)
            }
            layer.properties = layerProperties

            // layer.tiles

            const layerTiles: (tBINTile | null)[][] = []

            for (let tY = 0; tY < layer.heightTiles; tY++) {
                layerTiles[tY] = []
                for (let tX = 0; tX < layer.widthTiles; tX++) {
                    const t = tY * layer.widthTiles + tX;
                    layerTiles[tY][tX] = null
                    
                    // commented because pretty sure causing perf issues
                    // console.log(`getting tile index for tile ${t} on layer ${i}`)
                    const tileIndex = mod.ccall(
                        "map_layer_tile_get_index",
                        "number",
                        ["number", "number", "number"],
                        [mapPtr, i, t]
                    );
                    
                    // console.log(`getting tilesheet name for tile ${t} on layer ${i}`)
                    const tileSheet = getValue('map_layer_tile_get_tilesheet', 'number', ['number', 'number', 'number'], [mapPtr, i, t])

                    // console.log(`getting blend mode for tile ${t} on layer ${i}`)
                    const blendMode = mod.ccall(
                        "map_layer_tile_get_blend_mode",
                        "number",
                        ["number", "number", "number"],
                        [mapPtr, i, t]
                    );

                    // null tiles are just empty im pretty sure!
                    // if (tileSheet == "" || tileSheet.startsWith('_')) console.warn(`failed to get tilesheet for ${t} on ${i} (${layer.name}) - received '${tileSheet}'`)

                    if (tileIndex != -1 && tileSheet) {
                        const staticTile = new tBINStaticTile(tileIndex, blendMode, tileSheet)

                        const tp_outCountPtr = mod._malloc(4);

                        const tp_listPtr = mod.ccall(
                            "map_layer_tile_prop_keys_list",
                            "number",
                            ["number", "number", "number", "number"],
                            [mapPtr, tp_outCountPtr, i, t]
                        );

                        const tp_count = mod.getValue(tp_outCountPtr, "i32");
                        mod._free(tp_outCountPtr);

                        const tp_keys: string[] = [];
                        tp_keys.length = tp_count;

                        for (let k = 0; k < tp_count; k++) {
                            const strPtr = mod.getValue(tp_listPtr + k * 4, "i32");
                            tp_keys[k] = mod.UTF8ToString(strPtr);
                        }

                        mod.ccall("map_free_string_list", null, ["number", "number"], [tp_listPtr, tp_count]);

                        for (const key of tp_keys) {
                            const valPtr = mod.ccall(
                                "map_layer_tile_prop_get_value",
                                "number",
                                ["number", "string", "number", "number"],
                                [mapPtr, key, i, t]
                            );

                            const val = mod.UTF8ToString(valPtr);
                            staticTile.properties.set(key, val);
                        }

                        layerTiles[tY][tX] = staticTile;
                    }
                }
            }

            layer.tiles = layerTiles

            tbjs.tiles.layers.push(layer)
        } catch (e) {
            console.warn(`failed creating layer ${i}`, e)
        }
    }


    // rewriting properties
    tbjs.properties.all().forEach(key => {
        console.log(`map property on ${tbjs.meta?.selfMapName}: ${key}`)
        // i think actions are tiledata maybe? not sure how to do that. not sure if i can do that. need to figure that out.
        if (key == 'Warp') {
            const value = tbjs.properties?.get(key)
            if (!value) return;

            const warpsSplit = value.split(" ");
            const warps = [];

            for (let i = 0; i < warpsSplit.length; i += 5) {
                warps.push(warpsSplit.slice(i, i + 5));
            }

            tbjs.properties?.set(key, warps
                .map((w) => {
                    if (customMapNames.includes(w[2])) {
                        w[2] = `Custom_${w[2]}`;
                    }
                    return w.join(" ");
                })
                .join(" ")
            )
        }
    })

    return tbjs.export('tmx');
}