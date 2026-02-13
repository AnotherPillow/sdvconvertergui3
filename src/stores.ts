import { get, writable } from "svelte/store";

export const dialogOpen = writable(false)

export const converterOutputLog = writable('Run a converter to see its output...')
export const logOutput = (output: string) => {
    converterOutputLog.set(
        get(converterOutputLog) + '\n' + output
    )
}