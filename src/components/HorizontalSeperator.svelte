<script lang="ts"></script>

<div class="horizontal-border"></div>

<style lang="scss">
@use "../data";

    .horizontal-border {
        width: calc(100% + 32px);
        height: 0px;
        margin: 0;
        padding: 0;
        @include data.border_image_side(12px, top);
    }
</style>