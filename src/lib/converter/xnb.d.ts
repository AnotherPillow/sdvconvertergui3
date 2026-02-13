declare module 'xnb' {
    export type _dataType = 'JSON' | 'yaml' | 'Texture2D' | 'Effect' | 'TBin' | 'BmFont' | 'Others'
    // throws if invalid
    export function unpackToContent(file: File): Promise<{
        type: _dataType,
        content: Blob
    }> {}
}