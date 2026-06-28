<script>
	import { Command as CommandPrimitive } from "cmdk-sv";
	import Search from "lucide-svelte/icons/search";
	import { cn } from "$lib/utils";
	let className = undefined;
	export { className as class };
    export let oClass = "";
	export let value = "";
    export let searchVisible = true;
</script>

<div class={cn('flex items-center', oClass)} data-cmdk-input-wrapper="">
    {#if searchVisible}
	    <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
    {/if}
	<CommandPrimitive.Input
		class={cn(
			className
		)}
		{...$$restProps}
		bind:value
	/>
</div>
