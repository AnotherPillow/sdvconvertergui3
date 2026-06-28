<script lang="ts">
    import getTmxFromTbin from "$lib/translation/tbin-tmx.js";
    import { cn } from "$lib/utils.js";
    import * as Dialog from "../lib/components/ui/dialog/index.js";
    import { Label } from "../lib/components/ui/label/index.js";

    let selectedFile: File | null = null;
    let finishedOutput: string | null = null;
    let isConverting = false;

    const doConversion = async (event: SubmitEvent) => {
        event.preventDefault();

        if (!selectedFile || isConverting) return;

        isConverting = true;

        try {
            const buf = await selectedFile.arrayBuffer();
            const bytes = new Uint8Array(buf);
            const tmx = await getTmxFromTbin(bytes, []);

            finishedOutput = tmx;
            umami.track('tbin-tmx-convert-success');
        } 
        catch (err) { 
            console.error(err); 
            umami.track('tbin-tmx-convert-fail');
        } 
        finally { isConverting = false; }
    }

    const download = (str: string, filename = "map.tmx") => {
        const blob = new Blob([str], { type: "application/xml" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    }

    const outputFileName = () => selectedFile?.name.split('.')[0] + '.tmx'

</script>

<Dialog.Root>
    <Dialog.Trigger
        type="button"
        class={cn("styled-lightly-btn second-class-for-specificity bg-transparent")}
    >
        <slot />
    </Dialog.Trigger>

    <Dialog.Content class="sm:max-w-[425px] sdv-dialog">
        <form class="bg-[wheat]" on:submit={doConversion}>
            <Dialog.Header>
                <Dialog.Title class="text-xl m-0">
                    Convert .tBIN files to .tmx files
                </Dialog.Title>
                <Dialog.Description>
                    Converts maps using the same code TMXL2CP does. It won't be perfect
                </Dialog.Description>
            </Dialog.Header>

            <div class="grid gap-4">
                <div
                    class="flex gap-3 justify-center items-center parent-of-tbin-input py-2 rounded-sm transition-colors"
                >
                    <Label for="input-tbin" class="inline w-fit">
                        .tBIN file:
                    </Label>
                    <input
                        id="input-tbin"
                        name="input-tbin"
                        type="file"
                        class="inline w-60"
                        required
                        accept=".tbin"
                        on:change={(ev) => selectedFile = ev.currentTarget?.files?.[0] ?? null}
                    />
                </div>

                <div class="grid gap-3 justify-center">
                    <button
                        id="map-convert-btn"
                        type="submit"
                        class="w-fit border-none outline-none bg-transparent cursor-pointer mx-auto"
                        disabled={isConverting}
                    >
                        {#if isConverting}
                            <span class="spinner" aria-label="Loading"></span>
                        {:else}
                            <img
                                src="/images/convert_btn.png"
                                alt="convert"
                                id="convert-img"
                                width="117"
                                height="39"
                                class="clickable"
                            />
                        {/if}
                    </button>
                </div>

                {#if finishedOutput && !isConverting}
                    <div class="grid gap-3 justify-center">
                        {outputFileName()}
                        <button 
                            on:click={() => download(finishedOutput ?? '', outputFileName())}
                            class="w-fit border-none outline-none bg-transparent cursor-pointer mx-auto"
                            type="button"
                        > <!-- it can't be null btw so it'll never be '', this html only exists if it's truthy-->
                            <img
                                src="/images/export_btn.png"
                                alt="export"
                                id="export-map-img"
                                width="102"
                                height="39"
                                class="clickable"
                            />
                        </button>
                    </div>
                {/if}
            </div>
        </form>
    </Dialog.Content>
</Dialog.Root>

<style lang="scss">
    @use "../data";

    :global(.sdv-dialog) {
        background-color: wheat;
        @include data.border_image(12px, "../");
    }

    .parent-of-tbin-input {
        &:has(:user-invalid) {
            background-color: rgb(248, 154, 154);
        }
    }

    .spinner {
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 3px solid rgba(0, 0, 0, 0.2);
        border-top-color: rgba(0, 0, 0, 0.8);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>