<script lang="ts">
    import Blurrer from '../components/Blurrer.svelte';
    import Main from '../components/Main.svelte';
    import StardewStyleToast from '../components/StardewStyleToast.svelte';
    import '../styles.scss'

    import converters from '../lib/converters'
    import { objectToArray } from '../util';
    import { onMount } from 'svelte';
    import CornerLinks from '../components/CornerLinks.svelte';

    let _sendToast: typeof window.SendToast = null as unknown as typeof window.SendToast;

    onMount(() => {
        window.SendToast = _sendToast!
    })
    
</script>

<StardewStyleToast bind:SendToast={_sendToast}/>
<Blurrer />
<CornerLinks />

<main>
    <Main />
</main>

<style lang="scss">
    @use "../data";

    main {
        position: relative;
        z-index: 4;

        width: var(--main-width);
        min-height: var(--main-height); 
        height: auto;

        background-clip: padding-box;
        background-color: wheat;
        padding: 30px;

        left: 50%;
        top: calc(calc(100vh - var(--main-height)) / 4);
        transform: translateX(-50%);

        @include data.border_image;
    }

</style>
