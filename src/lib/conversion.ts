import converters from "./converters"
import type { Manifest } from "./types"

export const ConvertMod = (manifest: Manifest, files: File[], converterName: string): Promise<string> => {
    return new Promise<string>(async (resolve) => {
        const converter = converters.find(x => x.Name == converterName)
        
        if (!converter) return resolve('error|Failed to get converter')
        if (!manifest.ContentPackFor || manifest.EntryDll) return resolve('error|Is not a content pack.')
        
            // const result = await converter.Convert?.(manifest, files)
        const instance = new converter.Convert!(manifest, files)
        if (!instance) return resolve('error|Failed to convert mod.')
        
        return resolve('success|' + await instance.convert())

    })
}