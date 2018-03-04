import { stringify } from 'querystring';
import 'whatwg-fetch';

export interface IApiOptions {
    /** 请求的方法 */
    method?: 'GET' | 'POST'

    /** 请求的参数,get和post都是用这个传参 */
    body?: any
}

export interface IApiResult {
    /** 请求返回状态 */
    state: {
        /** 返回码 */
        code: number
        /** 返回信息 */
        msg: string
    }
    /** 返回数据内容 */
    data: any
}

export default function api(url: string, options: IApiOptions = {
    method: 'GET',
    body: {}
}): Promise<IApiResult> {
    url = options.method === 'GET' ? `${url}?${stringify(options.body)}` : url;

    return fetch(url, {
        method: options.method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: options.method === 'POST' ? JSON.stringify(options.body) : null
    })
    .then((res: Response) => res.json());
}
