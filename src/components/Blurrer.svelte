<script lang="ts">
    export let blur = '8px';
    // export let mode: 'dark' | 'light' = 'dark';
    /** * @type {'dark' | 'light'} */
    export let mode = 'dark';

</script>

<div class="blurrer {mode}" style="filter: blur({blur})"></div>

<style lang="scss">
    .blurrer {
        z-index: 1;
        
        position: fixed;
        inset: 0;
        // transform: scale(1.05);

        width: 100%;
        height: 100%;

        overflow: hidden;
        --tw-ring-offset-color: transparent;

        background-repeat: no-repeat;
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
    }

    .dark {
        background-color: rgba(0, 0, 0, 0.7);
        background-image: url('/images/background.png');
    }
</style>