import CreatePromise from '../CreatePromise'

export default function(file: File) {
    const [ promise, resolve, _ ] = CreatePromise<string>()

    const reader = new FileReader()
    reader.readAsBinaryString(file)
    reader.onloadend = () => resolve(reader.result?.toString() ?? '')

    return promise
}