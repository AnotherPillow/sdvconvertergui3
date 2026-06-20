<!-- again stolen from xnb2cp - https://github.com/AnotherPillow/XNB2CP/blob/main/src/index.scss#L326 / https://github.com/AnotherPillow/XNB2CP/blob/main/index.html#L32 -->

<script lang="ts">
    import { FileCode } from "lucide-svelte";

    
</script>

<div class="credits-overlay">
    <a href="https://github.com/anotherpillow/sdvconvertergui3" target="_blank">
        <FileCode class="gh-icon" />
    </a>
</div>

<style lang="scss">
    @keyframes move-onscreen {
        0% {
            margin: 0;
        }
        100% {
            margin-right: 1rem;
            margin-left: 1rem;
            margin-bottom: 1rem;
        }
    }

    @keyframes move-offscreen {
        0% {
            margin-right: 1rem;
            margin-left: 1rem;
            margin-bottom: 1rem;
        }
        100% {
            margin: 0;
        }
    }

    .credits-overlay {
        z-index: 10;
        position: absolute;
        width: 100vw;
        height: 100vh;
        pointer-events: none;

        a {
            text-decoration: none;
            color: inherit;
            cursor: pointer;
            pointer-events: all; 
    
            position: absolute;
            bottom: -1.5rem;
            left: -1.5rem;
        }
    }

    :global(.gh-icon) {
        width: 5rem;
        height: 5rem;

        rotate: 45deg;
        color: black;

        &:hover {
            animation: move-onscreen 0.5s ease-in-out forwards;
        }

        &:not(:hover) {
            animation: move-offscreen 0.5s ease-in-out forwards;
        }
    }
</style>