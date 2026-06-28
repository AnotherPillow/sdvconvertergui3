<script lang="ts">
    // for some reason had to manually add this, 0.14 doesnt have it but latest does
    import { Dialog as DialogPrimitive } from "bits-ui";
    import type { ComponentProps } from "svelte";

    type $$Props = ComponentProps<DialogPrimitive.Close>;

    export let el: $$Props["el"] = undefined;
    export let type: $$Props["type"] = "button";
</script>

<DialogPrimitive.Close
    bind:el
    data-slot="dialog-close"
    {type}
    {...$$restProps}
/>