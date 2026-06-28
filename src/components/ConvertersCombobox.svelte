<script lang="ts">
    // @ts-ignore
    import Check from "lucide-svelte/icons/check";
    // @ts-ignore
    import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
    import * as Command from "../lib/components/ui/command";
    import * as Popover from "../lib/components/ui/popover";
    import { Button } from "../lib/components/ui/button";
    import { cn } from "$lib/utils";
    import { tick } from "svelte";
    import converters from "$lib/converters";
    import { get } from "svelte/store";

    export let selectedValue = ''
   
    let open = false;
    let value = "";

    $: {
        selectedValue =
            converters.find((f) => f.Name === value)?.Name ??
            "Choose a Converter...";
    }
   
    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    function closeAndFocusTrigger(triggerId: string) {
        open = false;
        tick().then(() => {
            document.getElementById(triggerId)?.focus();
        });
    }

    const handleCheckTyper = (f: (c: any) => void) => f
</script>
   
<Popover.Root bind:open let:ids>
    <Popover.Trigger asChild let:builder>
        <Button
            builders={[builder]}
            variant="primary"
            role="combobox"
            aria-expanded={open}
            class="justify-between py-0 sdv-dropdown relative rounded-none sdv px-2 pr-6 text-md h-[100/3px]"
        >
            {selectedValue}
            <!-- <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" /> -->
            <img src="/images/dropdown-arrow.png" alt="arrow" class="z-10 absolute right-0 sdv-dropdown-arrow"/>
            {#if selectedValue != '' && 
                converters.find(x => x.Name == selectedValue)?.Repo != undefined}
                <span id="show-converter-repo">
                    <a href={converters.find(x => x.Name == selectedValue)?.Repo} target="_blank" title="Open Repository">
                        <img src="/images/repo_arrow.png" alt=">">
                    </a>
                </span>
            {/if}
        </Button>
    </Popover.Trigger>
    <Popover.Content class="sdv-dropdown-content-outer p-0 z-10">
        <Command.Root class="sdv-dropdown-content">
            <Command.Input searchVisible={false} 
                class="sdv text-md text-black converter-searchbox" 
                oClass="searchbox-sdv-seperator-bottom" 
                placeholder="Search Converters..." />
            <Command.Empty>No framework found.</Command.Empty>
            <Command.Group class="sdv">
                {#each converters as framework}
                    <Command.Item
                        value={framework.Name}
                        class={`text-2xl leading-none text-center converter-item ${framework.Name == selectedValue ? 'bg-sdv_dropdown_unsel' : ''}`}
                        onSelect={handleCheckTyper((currentValue) => {
                            value = currentValue;
                            closeAndFocusTrigger(ids.trigger);
                        })}
                    >
                        <!-- <Check
                            class={cn(
                            "mr-2 h-4 w-4",
                            value !== framework.value && "text-transparent"
                            )}
                        /> -->
                        {#if framework.Convert}
                            {framework.Name}
                        {:else}
                            <span class="strikethrough">{framework.Name}</span>
                        {/if}


                        
                    </Command.Item> 
                {/each}
            </Command.Group>
        </Command.Root>
    </Popover.Content>
</Popover.Root>



<style lang="scss">
    @use "../data";

    $dropdown-width: 200px;

    $dropdown-height: calc(#{$dropdown-width} / 6);

    :global(.sdv-dropdown) {
        @include data.dropdownBorder;
        @include data.dropDownBorderRounding;
        
        position: relative;
        min-width: $dropdown-width;
        width: fit-content;
        height: $dropdown-height;

        font-size: 1.25em;
        padding-right: 30px;
        
        color: data.$sdv-dropdown-colour;
        background-color: data.$sdv-dropdown-unselected;

        &:hover, &:active, &:focus, &:focus-visible, &:focus-within, &:target {
            @include data.dropdownBorder;
            @include data.dropDownBorderRounding;
            
            box-shadow: none !important;

            filter: brightness(0.8);
        }
    }

    :global(.sdv-dropdown-content) {
        @include data.dropdownBorder;
        border-radius: 0;

        box-shadow: none !important;
        outline:  none !important;
        
        color: data.$sdv-dropdown-colour;
        background-color: data.$sdv-dropdown-unselected;
    }

    :global(.sdv-dropdown-content-outer) {
        z-index: 10;
        border-radius: 0;
        width: calc(#{$dropdown-width} / 0.9);
        
        color: data.$sdv-dropdown-colour;
        background-color: data.$sdv-dropdown-unselected;

        box-shadow: none !important;
        outline:  none !important;
    }

    :global(.converter-searchbox) {
        outline: none;
        background: none;
        border: none;
        
        font-size: 1.5em;
        padding-left: 8px;
    }

    :global(.converter-searchbox::placeholder) {
        color: black;
        opacity: 0.8;
    }

    :global(.converter-item) {
        font-size: 1.5em;
    }

    .sdv-dropdown-arrow {
        height: inherit;
        aspect-ratio: 1;
        
        
        position: absolute;
        right: calc(#{$dropdown-width} / -15);
        top: -3px;
    }

    #show-converter-repo {
        position: absolute;
        right: -45px;

        
        
        height: inherit;
        a {
            height: inherit;
            display: flex;
            place-items: center;

            img {
                height: 80%;
            }
        }
    }

    :global(.strikethrough) {
        text-decoration: line-through;
    }
</style>