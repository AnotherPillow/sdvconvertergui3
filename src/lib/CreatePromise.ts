type re<T> = (value: T | PromiseLike<T>) => void
type returnValue<T> = [Promise<T>, re<T>, re<T>]

function create<T>(): returnValue<T> {
    let resolve: re<T> = null as unknown as re<T>
    let reject: re<T> = null as unknown as re<T>
    const promise = new Promise((r1, r2) => {
        resolve = r1;
        reject = r2
    }) as Promise<T>

    return [ promise, resolve, reject ]
}

export default create