<script lang="ts">

    import ConverterOutput from './ConverterOutput.svelte';
    import ConvertersCombobox from './ConvertersCombobox.svelte';
    import UploadFiles from './UploadFiles.svelte';
    import { ConvertMod } from '$lib/conversion';
    import type { Manifest } from '$lib/types';
    import { downloadFile } from '../util';
    import HorizontalSeperator from './HorizontalSeperator.svelte';
    import TitleRegion from './TitleRegion.svelte';

    let selectedConverter = '';
    let selectedManifest: Manifest | null = null;
    let selectedFiles: File[] = [];

    let conversionComplete = false;
    let downloadFileURL = ''

    // window.runtime.EventsOn('CONVERTER_MOD_DONE', (path) => {
    //     conversionComplete = true;
    //     downloadFileURL = path
    // })

    
    const exportMod = () => {
        window.SendToast("The converted mod's download has begun.", 2000, 200, 'rgb(168, 190, 226);')
        downloadFile(downloadFileURL, `${selectedManifest?.UniqueID}_${selectedConverter}.zip`)
        umami.track('mod-exported', { converter: selectedConverter });
    }

    const convertMod = () => {
        conversionComplete = false;
        downloadFileURL = '';

        if (!selectedManifest) return window.SendToast(
            'No manifest selected!', 2000, 100, '#f5bbb3'
        )

        if (!selectedConverter) return window.SendToast(
            'No converter selected!', 2000, 100, '#f5bbb3'
        )

        ConvertMod(selectedManifest!, selectedFiles, selectedConverter).then(response => {
            console.log(response)
            const [type, message] = response.split('|')

            const colour = type == 'error' ? '#f5bbb3' : '#D1F5B3'
            
            if (type == 'success') {
                conversionComplete = true;
                downloadFileURL = message
                window.SendToast('Mod converted successfully!', 6000, 200, colour)
            } else {
                window.SendToast(message, 6000, 200, colour)
            }
        })
    }

</script>

<TitleRegion />

<div id="columns">
    <div class="column col-right">
        <UploadFiles bind:selectedManifest={selectedManifest} bind:selectedFiles={selectedFiles} />
        
        <HorizontalSeperator />

        <button id="convert-btn" on:click={convertMod}>
            <img src="/images/convert_btn.png" alt="convert" id="convert-img" />
        </button>
        {#if conversionComplete}
            <button id="export-btn" on:click={exportMod}>
                <img src="/images/export_btn.png" alt="convert" id="export-img"/>
            </button>
        {/if}
        <div id="hidden-download-links">

        </div>
    </div>
    <div class="column">
        <ConvertersCombobox bind:selectedValue={selectedConverter} />
        <ConverterOutput />
    </div>
</div>


<style lang="scss">
    @use "../data";
    h1 {
        font-weight: bold;
        font-size: 2em;
    }

    .result {
        height: 20px;
        line-height: 20px;
        margin: 1.5rem auto;
    }

    #columns {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;

        gap: 20px;

        .col-right {
            justify-content: space-evenly;
        }

        .column {
            flex: 1 1 300px;
            min-width: 0;
            min-height: 60vh;

            padding: 1em;

            display: flex;
            position: relative;
            flex-direction: column;

            align-items: center;

            @include data.border_image(12px, "../");
        }
    }

    #convert-btn, #export-btn {
        background-color: transparent;
        cursor: pointer;
        
        outline: none;
        border: none;

        &:hover {
            filter: brightness(0.8);
        }
        
        #convert-img, #export-img {
            height: 3em;
            aspect-ratio: 3 / 1;
        }
    }

    #hidden-download-links {
        display: none;

    }

</style>