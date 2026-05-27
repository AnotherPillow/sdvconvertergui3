import type { Manifest } from "$lib/types";

export default class BaseConverter {
    public outputContent = {
        "Format": "2.0",
        "Changes": [] as any[]
    }
    public outputManifest: Manifest

    constructor(public manifest: Manifest, public files: File[], public oldFrameworkUID: string, public newFrameworkUID: string, public converterName: string) {
        this.outputManifest = structuredClone(manifest)
        this.outputManifest.Dependencies?.filter(x => x.UniqueID.toLowerCase() != this.oldFrameworkUID.toLowerCase())
        this.outputManifest.Author += ' ~ ' + this.converterName
        
        if (this.outputManifest.ContentPackFor?.UniqueID) this.outputManifest.ContentPackFor = { UniqueID: this.newFrameworkUID }
    }

    convert(): Promise<string | null> {
        return new Promise<string | null>(() => {})
    }
}