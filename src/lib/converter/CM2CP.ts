import type { Manifest } from "$lib/types"
import { converterOutputLog, logOutput } from "../../stores";
import { catchAndNotify } from "../../util"
import JSON5 from 'json5'
import JSZip from 'jszip';
import BaseConverter from "./base";

export default class CM2CP extends BaseConverter {
    constructor(public manifest: Manifest, public files: File[]) {
        super(manifest, files, 'platonymous.custommusic', 'Pathoschild.ContentPatcher', 'CM2CP')
    }

    convert() {
        return new Promise<string | null>(async resolve => {
            const uid = this.manifest.UniqueID

            const contentFile = this.files.find(x => x.name == 'content.json')
            if (!contentFile) return null

            const content: any | null | undefined = await catchAndNotify(
                async () => JSON5.parse((await contentFile.text())),
            'Unreadable content.json selected!') as any | null | undefined
            if (!content || !content.Music) return null

            const entries = []

            for (const track of content.Music) {
                entries.push({
                    [track['Id']]: { // Ideally ID would be actually unique, but would require modifying of other parts.
                        'ID': track['Id'], 
                        'FilePaths': [
                            `{{AbsoluteFilePath: ${track["File"]}}}`
                        ],
                        'Category': track.Ambient ? 'Ambient' : 'Default',
                        'Looped': !!track.Loop,
                    }
                })
            }
    
            this.outputContent.Changes.push({
                "Action": "EditData",
                "Target": "Data/AudioChanges",
                "Entries": entries
            })       

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