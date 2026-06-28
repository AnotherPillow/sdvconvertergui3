<script>
	import { Dialog as DialogPrimitive } from "bits-ui";
	import X from "lucide-svelte/icons/x";
	import * as Dialog from ".";
	import { cn, flyAndScale } from "$lib/utils";
	let className = undefined;
	export let transition = flyAndScale;
    /**
     * @type {any}
     */
    export let transitionConfig = {
		duration: 200,
	};
	export { className as class };
</script>

<Dialog.Portal>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		{transition}
		{transitionConfig}
		class={cn(
			"fixed left-[50%] top-[50%] z-50 grid lg:w-full w-[unset] max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 shadow-lg sm:rounded-lg",
			className
		)}
		{...$$restProps}
	>
		<slot />
		<DialogPrimitive.Close
			class="absolute right-4 top-4 rounded-sm ring-offset-background focus:outline-none focus:brightness-80 filter disabled:pointer-events-none bg-transparent w-8 h-8 p-0 m-0 outline-none ring-none border-none"
		>
			<img 
                src="/images/cancel_btn.png"
                alt="Cancel"
                class="clickable"
                width="32"
                height="32"
            />
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</Dialog.Portal>
