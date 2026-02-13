// converts tbin from casey's tbin library to a tbin.js instance and then exports to tmx

import { tBINMeta } from "$lib/external/tbin/src/parsers/metadata";
import TBIN from "../extern/tbin/src/build/tbin";
import { tBIN as tBIN_js } from '../external/tbin/src/index'

export default async function getTmxFromTbin(bytes: Uint8Array): Promise<string> {
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

    tbjs.meta = new tBINMeta(new Uint16Array())
    //@ts-ignore
    tbjs.meta.selfMapNameLength = mod.UTF8ToString(mod.ccall(
        "map_get_id",
        "number",
        ["number"],
        [mapPtr]
    ))
    tbjs.meta.selfMapName
    tbjs.meta.propertiesCount

    console.log(tbjs)


    return "";
}