import type { Manifest } from "$lib/types";

export default class BaseConverter {
    public outputContent = {
        "Format": "2.0",
        "Changes": [] as any[]
    }
    public outputManifest: Manifest

    constructor(public manifest: Manifest, public files: File[], public oldFrameworkUID: string, public converterName: string) {
        this.outputManifest = structuredClone(manifest)
        this.outputManifest.Dependencies?.filter(x => x.UniqueID.toLowerCase() != this.oldFrameworkUID.toLowerCase())
        this.outputManifest.Author += ' ~ ' + this.converterName
    }

    convert(): Promise<string | null> {
        return new Promise<string | null>(() => {})
    }
}