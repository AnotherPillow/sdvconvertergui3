<script lang="ts">
    import MapConverterDialog from "./MapConverterDialog.svelte";


</script>

<div id="title-region">
    <div class="title-flex-child">
        <a class="styled-lightly-btn second-class-for-specificity" href="https://xnb.pillow.rocks?utm_source=sdvconvertergui3">
            <h2>
                <!-- it made by aviroen! -->
                <img 
                    src="/images/xnb_btn.png"
                    alt="XNB"
                    class="xnb-btn"
                    width="32"
                    height="32"
                />
                Convert XNB Mods
            </h2>
        </a>
    </div>
    <div class="title-flex-child borderer">
        <h1 class="title">sdvconvertergui3</h1>
    </div>
    <div class="title-flex-child">
        <MapConverterDialog>
            <h2>
                Convert .tBIN files
                <img 
                    src="/images/map_btn.png"
                    alt="Maps"
                    class="map-btn"
                    width="32"
                    height="32"
                />
            </h2>
        </MapConverterDialog>
    </div>
</div>

<style lang="scss">
    @use "../data";

    h1 {
        font-weight: bold;
        font-size: 2em;
    }
    
    h2 {
        font-size: 1.5em;

        display: flex;
        align-items: center;
        gap: 0.3rem;
    }

    #title-region {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        align-items: center;
        gap: 0.5rem;

        .title-flex-child {
            min-width: 0;
        }
    }

    // narrow screens
    @media (max-width: 1100px) {
        #title-region {
            grid-template-columns: 1fr;
        }
        .borderer {
            @include data.border_image_side(12px, bottom);
            @include data.border_image_side(12px, top);
            margin-left: -30px;
            margin-right: -30px;
        }
        .title-flex-child {
            min-height: 2em;
        }
        .title-flex-child:nth-child(2) {
            min-height: 3em;
        }
    }

    // wide screens
    @media (min-width: 1101px) {
        .borderer {
            @include data.border_image_side(12px, right);
            @include data.border_image_side(12px, left);
            margin-top: -30px;
            padding-top: 30px;
            align-self: stretch
        }
        .title-flex-child {
            min-height: 3em;
        }
    }

    button, a, :global(.styled-lightly-btn) {
        all: unset;
        display: inline-flex;
        align-items: center;
        cursor: pointer;
    }

    :global(.styled-lightly-btn.second-class-for-specificity) {
        cursor: pointer !important;
        padding: 0 4px !important;
        border-radius: 8px !important;

        &:hover {
            filter: brightness(0.8);
            background-color: #00000022;
        }
    }
</style>