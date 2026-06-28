<script lang="ts">
    import { cn } from "$lib/utils.js";
    import { Button, buttonVariants } from "../lib/components/ui/button/index.js";
    import * as Dialog from "../lib/components/ui/dialog/index.js";
    import { Input } from "../lib/components/ui/input/index.js";
    import { Label } from "../lib/components/ui/label/index.js";
    
    let selectedFile: FileList = new FileList()
    let finishedOutput: string | null = null // will be a data: url

    const doConversion = () => {

    }

</script>

<Dialog.Root>

    <!-- // having buttonVariants({ variant: "outline" }) in the trigger's classes,  as the original would makes it be a different size to the other one -->
    <Dialog.Trigger
        type="button"
        class={cn("styled-lightly-btn second-class-for-specificity bg-transparent")} 
    >
        <slot />
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px] sdv-dialog">
        <form class="bg-[wheat]" on:submit={doConversion}>
            <Dialog.Header>
                <Dialog.Title class="text-xl m-0">Convert .tBIN files to .tmx files</Dialog.Title>
                <Dialog.Description>
                    Converts maps using the same code TMXL2CP does. It won't be perfect
                </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4">
                <div class="flex gap-3 justify-center items-center parent-of-tbin-input py-2 rounded-sm transition-colors">
                    <Label for="input-tbin" class="inline w-fit">.tBIN file:</Label>
                    <input id="input-tbin" name="input-tbin" type="file" class="inline w-60" required bind:files={selectedFile}>
                </div>
                <div class="grid gap-3 justify-center">
                    <button id="map-convert-btn" type="submit" class="w-fit border-none outline-none bg-transparent cursor-pointer mx-auto">
                        <img src="/images/convert_btn.png" alt="convert" id="convert-img" width="117" height="39" class="clickable"/>
                    </button>
                <!-- <div class="grid gap-3">
                    <Label for="username-1">Username</Label>
                    <Input id="username-1" name="username" value="@peduarte" class="w-[unset]" />
                </div> -->
            </div>
            <!-- <Dialog.Footer>
                <Dialog.Close
                    type="button"
                    class={buttonVariants({ variant: "outline" })}
                >
                    Cancel
                </Dialog.Close>
                <Button type="submit">Save changes</Button>
            </Dialog.Footer> -->
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
</style>