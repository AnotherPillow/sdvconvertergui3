export const objectToArray = (dict: any) => {
    let output = []

    for (const key of Object.keys(dict)) {
        output.push(dict[key])
    }

    return output
}


export const catchAndNotify = (fun: () => void | Promise<void>, message: string) => {
    try {
        const f = fun()
        if (f && Object.hasOwn(f, 'catch')) f.catch(e => {
            console.error(e)
            window.SendToast?.(message, 2000, 100, '#f5bbb3')
        })
        return f
    } catch (e) {
        console.error(e)
        window.SendToast?.(message, 2000, 100, '#f5bbb3')
        return null
    }
}


// BROKEN - TODO: Fix
export const downloadFile = (dataurl: string, fn: string = 'converted-mod.zip') => {
    const a = document.createElement('a')
    a.href = dataurl
    a.download = fn

    document.querySelector('#hidden-download-links')!.appendChild(a)
    a.click()
    
}