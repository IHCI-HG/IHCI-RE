
/**
 * 全局的loading
 * @param status 是否显示loading
 * @param timeout loading持续时间
 */
export function loading (status: boolean, timeout?: number) {
    if ((window as any).loading) {
        (window as any).loading(status, timeout);
    }
}

/**
 * 全局的toast
 * @param msg toast显示的内容
 * @param timeout toast持续的时间
 */
export function toast (msg: string, timeout?: number) {
    if ((window as any).toast) {
        (window as any).toast(msg, timeout);
    }
}
