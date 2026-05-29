import type { Manifest } from "$lib/types"
import { converterOutputLog, logOutput } from "../../stores";
import { catchAndNotify } from "../../util"
import JSON5 from 'json5'
import JSZip from 'jszip';
import BaseConverter from "./base";

function fileToImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url); 
            resolve(img);
        };

        img.onerror = reject;
        img.src = url;
    });
}


export default class CM2CP extends BaseConverter {
    constructor(public manifest: Manifest, public files: File[]) {
        super(manifest, files, 'spacechase0.contentpatcheranimations', 'Pathoschild.ContentPatcher', 'CPA2SC')
    }

    convert() {
        return new Promise<string | null>(async resolve => {
            const uid = this.manifest.UniqueID

            const contentFile = this.files.find(x => x.name == 'content.json')
            if (!contentFile) return null

            const content: any | null | undefined = await catchAndNotify(
                async () => JSON5.parse((await contentFile.text())),
            'Unreadable content.json selected!') as any | null | undefined

            // do content stff
            const newChanges = (await Promise.all((content.Changes as any[]).map(async (change: any, index: number) => {

                if (change['AnimationFrameTime'] && change['AnimationFrameCount']) {
                    const from = change.Action == 'Load' ? this.files.find(f => f.webkitRelativePath.endsWith(change.FromFile)) : null
                    const fromImage = from ? await fileToImage(from) : null
                    console.log(`${change.Action} change fromfile ${change.FromFile} found at ${from}`)

                    if (change.FromFile.includes('{{') | change.Target.includes('{{')) {
                        logOutput(`Cannot parse tokens in change targeting {change["Target"]}. Skipping`)
                        null;
                    }

                    const newChange: any = {
                        LogName: change.LogName ? change.LogName : `Add animation for ${change.Target}`,
                        Action: 'EditData',
                        Target: 'spacechase0.SpaceCore/TextureOverrides',
                        Entries: {
                            [`${this.outputManifest.UniqueID}_${change.Target}_${index}`]: {
                                TargetTexture: change.Target,
                                TargetRect: from ? {
                                    "X": 0,
                                    "Y": 0,
                                    "Width": fromImage?.width,
                                    "Height": fromImage?.height,
                                } : change.ToArea,
                                SourceTexture: `{{InternalAssetKey: ${change.FromFile}}:0..${change.AnimationFrameCount - 1}@${change.AnimationFrameTime}`
                            },
                        }
                    }

                    
                    if (change.When) newChange.When = change.When
                    if (change.Update) newChange.Update = change.Update

                    return newChange
                }

                return change;
            }))).filter((c: any) => c)

            this.outputContent.Changes = newChanges

            if (content.ConfigSchema) this.outputContent.ConfigSchema = content.ConfigSchema
            if (content.DynamicTokens) this.outputContent.DynamicTokens = content.DynamicTokens

            const zip = new JSZip()
            const folderName = this.files.find(x => x.name == 'manifest.json')!.webkitRelativePath.split('/')[0]

            if (!this.outputManifest.Dependencies || !this.outputManifest.Dependencies?.find((d: any) => d.UniqueID.toLowerCase() == 'spacechase0.spacecore')) {
                this.outputManifest.Dependencies ??= []
                this.outputManifest.Dependencies.push({UniqueID: 'spacechase0.SpaceCore'})
            }
            
            zip.file<'string'>(`${folderName}/content.json`, JSON.stringify(this.outputContent, null, 4))
            zip.file<'string'>(`${folderName}/manifest.json`, JSON.stringify(this.outputManifest, null, 4))

            for (const file of this.files.filter(x => x.name != 'content.json' && x.name != 'manifest.json')) {
                
                const buf = await file.arrayBuffer()
                zip.file<'arraybuffer'>(file.webkitRelativePath, buf)
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