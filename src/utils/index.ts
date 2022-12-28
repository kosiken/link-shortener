// just a simple delay function
export function delayed(interval: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve()
        }, interval)
    })
}