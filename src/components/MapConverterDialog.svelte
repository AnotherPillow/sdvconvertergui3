<script lang="ts">
    import { cn } from "$lib/utils.js";
    import { Button, buttonVariants } from "../lib/components/ui/button/index.js";
    import * as Dialog from "../lib/components/ui/dialog/index.js";
    import { Input } from "../lib/components/ui/input/index.js";
    import { Label } from "../lib/components/ui/label/index.js";
    
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
        <form>
            <Dialog.Header>
                <Dialog.Title>Convert .tBIN files to .tmx files</Dialog.Title>
                <Dialog.Description>
                    Converts maps using the same code TMXL2CP does. It won't be perfect
                </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4">
                <div class="grid gap-3">
                    <Label for="name-1">Name</Label>
                    <Input id="name-1" name="name" value="Pedro Duarte"  class="w-[unset]" />
                </div>
                <div class="grid gap-3">
                    <Label for="username-1">Username</Label>
                    <Input id="username-1" name="username" value="@peduarte" class="w-[unset]" />
                </div>
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
</style>