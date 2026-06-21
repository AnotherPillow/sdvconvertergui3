<script lang="ts">
    import { converterOutputLog } from "../stores";
</script>


<textarea id="converter-output" class="code" disabled>{$converterOutputLog}</textarea>

<style lang="scss">
    @use "../data";

    textarea {
        flex-grow: 1;
        min-height: 2em;
        width: 90%;
        
        margin: 2em 0;
        padding: 5px;
        font-size: 11px;
        color: rgb(62, 62, 62);
        
        scrollbar-width: none;
        cursor: text;
        
        @include data.border_image(8px, "../");
        border-radius: 8px;
        
        background-color: rgb(200, 182, 147);

        outline: none;
        &:active, &:focus, &:focus-within {
            outline: none;

        }
    }
</style>