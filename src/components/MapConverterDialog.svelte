<script lang="ts">
    import { cn } from "$lib/utils.js";
    import { Button, buttonVariants } from "../lib/components/ui/button/index.js";
    import * as Dialog from "../lib/components/ui/dialog/index.js";
    import { Input } from "../lib/components/ui/input/index.js";
    import { Label } from "../lib/components/ui/label/index.js";
    import '../app.pcss'
</script>

<Dialog.Root>
    <Dialog.Trigger
        type="button"
        class={cn(buttonVariants({ variant: "outline" }), "styled-lightly-btn second-class-for-specificity")}
    >
        <slot />
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <form>
            <Dialog.Header>
                <Dialog.Title>Edit profile</Dialog.Title>
                <Dialog.Description>
                    Make changes to your profile here. Click save when
                    you're done.
                </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4">
                <div class="grid gap-3">
                    <Label for="name-1">Name</Label>
                    <Input id="name-1" name="name" value="Pedro Duarte" />
                </div>
                <div class="grid gap-3">
                    <Label for="username-1">Username</Label>
                    <Input id="username-1" name="username" value="@peduarte" />
                </div>
            </div>
            <Dialog.Footer>
                <Dialog.Close
                    type="button"
                    class={buttonVariants({ variant: "outline" })}
                >
                    Cancel
                </Dialog.Close>
                <Button type="submit">Save changes</Button>
            </Dialog.Footer>
        </form>
    </Dialog.Content>
</Dialog.Root>