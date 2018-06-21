import { stringify } from 'querystring';
import 'whatwg-fetch';

const crypto = require('crypto');

export interface IApiOptions {
    /** 请求的方法 */
    method?: 'GET' | 'POST'

    /** 请求的参数,get和post都是用这个传参 */
    body?: any
}

// 7e1977739c748beac0c0fd14fd26a544

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

// 这是登录专用的 api
export function authApi(un: string, pw: string): any {
    const hpw = crypto.createHmac('sha1', '7e1977739c748beac0c0fd14fd26a544').update(pw).digest('hex');
    const result = api('/api/login', {
        method: 'POST',
        body: {
            username: un,
            password: hpw
        }
    })
    return result
}
<<<<<<< HEAD
=======


// post put(patch) delete get
// restful

>>>>>>> cd34279970900fc13cfc41acbe72568f9ea58418
