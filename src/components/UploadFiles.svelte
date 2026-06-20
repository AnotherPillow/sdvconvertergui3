<script lang="ts">
    // import { ChooseManifest } from '../../wailsjs/go/main/App.js'
    import { dialogOpen } from '../stores'
    import { get } from 'svelte/store';
    import JSON5 from 'json5'
    import { catchAndNotify } from '../util';
    import type { ChangeEventHandler, MouseEventHandler } from 'svelte/elements';
    import type { Manifest } from '$lib/types';

    export let selectedManifest: null | Manifest = null;
    export let selectedFiles: File[] = [];

    const onChange = async (e: Event & { currentTarget: EventTarget & HTMLInputElement; }) => {
        const files = Array.from(e.currentTarget.files ?? [])
        if (files.length <= 2) return window.SendToast?.('Invalid mod.', 2000, 100, '#f5bbb3')

        const manifestFile = files.find(file => file.name == 'manifest.json' && file.webkitRelativePath.split('/').length == 2)
        if (!manifestFile) return window.SendToast?.('No manifest found (is it in the root of the uploaded folder?)', 2000, 100, '#f5bbb3')

        const manifest: Manifest | null | undefined = await catchAndNotify(
            async () => JSON5.parse((await manifestFile.text()).replace(/[\r\n]/g, '')),
        'Unreadable manifest selected!') as Manifest | null | undefined

        if (!manifest) return;

        console.log(manifest)
        selectedFiles = files

        if (!manifest.Name || !manifest.Author || !manifest.UniqueID || !manifest.Description) {
            window.SendToast("Invalid manifest selected!", 2000, 100, '#f5bbb3')
            umami.track('invalid-manifest-selected');
            return selectedManifest = null;
        } else if (!manifest?.ContentPackFor?.UniqueID) {
            window.SendToast("C# mod selected - please choose a content pack.", 5000, 100, '#f5bbb3')
            umami.track('csharp-manifest-selected');
            return selectedManifest = null;
        }

        umami.track('mod-uploaded-success');
        selectedManifest = manifest
    }

    let _file_input: HTMLElement | null = null;

    const notypecheck = (x:any)=>x;
</script>

<span id="file-uploader-area" class="flex"> 
    <label for="file-input" class="file-label" >
        <img 
            src="/images/files_btn.png"
            alt="Upload"
            class="file-btn clickable"
            width="50"
            height="50"
        />
        <h3>
            {#if selectedManifest == null}
                Choose a folder containing manifest.json
                <br>
                Click <a href="https://xnb.pillow.rocks">here</a> for XNB2CP.
                <br>
                A usage guide can be found <a href="https://github.com/AnotherPillow/sdvconvertergui3#usage" target="_blank">here</a>.
            {:else}
                {selectedManifest.Name}
            {/if}
        </h3>
    </label>
    <!-- @ts-ignore -->
    <input 
        {...notypecheck({
            directory: true,
            webkitdirectory: true,
        })}
        type="file"
        class="file-input"
        id="file-input" 
        multiple={true}
        on:change={onChange}
        bind:this={_file_input}
    />
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    
</span>

<style lang="scss">

    #file-uploader-area {
        cursor: pointer;
        width: max-content;
        color: var(--main-color);

        align-items: center;
        font-weight: bold;

        #file-input {
            opacity: 0;
            width: 0;
        }

        h3 {
            padding-left: 5px;
        }
    }

</style>