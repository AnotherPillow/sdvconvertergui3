import type { Manifest } from "$lib/types"
import { converterOutputLog, logOutput } from "../../stores";
import { catchAndNotify } from "../../util"
import JSON5 from 'json5'
import JSZip from 'jszip';
import BaseConverter from "./base";

export default class SAAT2CP extends BaseConverter {
    constructor(public manifest: Manifest, public files: File[]) {
        super(manifest, files, 'zerometers.saat.mod', 'Pathoschild.ContentPatcher', 'SAAT2CP')
    }

    convert() {
        return new Promise<string | null>(async resolve => {
            const uid = this.manifest.UniqueID

            const tracksFile = this.files.find(x => x.name == 'tracks.json')
            if (!tracksFile) return null

            const tracks: any | null | undefined = await catchAndNotify(
                async () => JSON5.parse((await tracksFile.text())),
            'Unreadable content.json selected!') as any | null | undefined
            if (!tracks) return null

            for (const track of tracks) {
                if (track.Settings?.AddToJukebox) {
                    const jb_entry = {
                        [track.Id]: {
                            Name: `${this.manifest.Name} - ${track.Id}`,
                            Available: true,
                        }
                    }
                    const jb_change = {
                        Action: "EditData",
                        Target: "Data/JukeboxTracks",
                        Entries: jb_entry
                    }
                    this.outputContent.Changes.push(jb_change)
                }

                const entry = {
                    [track.Id]: {
                        ID: track['Id'], 
                        FilePaths: [
                            `{{AbsoluteFilePath: ${track.Filepath}}}`
                        ],
                        Category: track.Category,
                        Looped: !!track.Settings?.Loop
                    }
                }

                const change = {
                    Action: "EditData",
                    Target: "Data/AudioChanges",
                    Entries: entry
                }

                this.outputContent.Changes.push(change)
            }   

            const zip = new JSZip()
            const folderName = this.files.find(x => x.name == 'manifest.json')!.webkitRelativePath.split('/')[0].replace('[SAAT]', '[CP]')
            
            zip.file<'string'>(`${folderName}/content.json`, JSON.stringify(this.outputContent, null, 4))
            zip.file<'string'>(`${folderName}/manifest.json`, JSON.stringify(this.outputManifest, null, 4))

            for (const file of this.files.filter(x => x.name != 'content.json' && x.name != 'manifest.json' && x.name != 'tracks.json')) {
                
                const buf = await file.arrayBuffer()
                zip.file<'arraybuffer'>(file.webkitRelativePath.replace('[SAAT]', '[CP]'), buf)
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