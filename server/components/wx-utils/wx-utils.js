import fetch from 'isomorphic-fetch';

import {redisPromiseGet, redisPromiseSet} from '../../middleware/redis-utils/redis-utils'

// 网页登录，用 code 拿用户的 access_token (包括openid 和 unionid)
export const web_TokenToAccessToken = async function(token) {
    const result = await fetch(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${conf.webAppId}&secret=${conf.webAppSe}&code=${code}&grant_type=authorization_code`)
    const data = await result.json()
    return data
}

// 网页登录，用access_token + openid 拿用户信息
export const web_accessTokenToUserInfo = async function(accessToken, openid) {
    const result = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}`)
    const data = await result.json()
    return data
}

// 网页登录，用token拿用户信息
export const web_accessTokenToUserInfo = async function(token) {
    const accessTokenResult = await web_TokenToAccessToken()
    const result = await fetch(`https://api.weixin.qq.com/sns/userinfo?access_token=${accessTokenResult.access_token}&openid=${accessTokenResult.openid}`)
    const data = await result.json()
    return data
}


// 服务号拿access_token
export const pub_getAccessToken = async function() {

    // 先从缓存中找access_token
    let accseeToken = await redisPromiseGet('pub_access_token')
    if(accseeToken) {
        return accseeToken
    }

    const result = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${conf.pubAppId}&secret=${conf.pubAppSe}`)
    const data = await result.json()
    if(data.access_token) {
        redisPromiseSet('pub_access_token', data.access_token, (data.expires_in || 200) - 200)
        return data.access_token
    }

}

// 服务号获取用户信息
export const pub_openidToUserInfo = async function(openid) {
    const accseeToken = await pub_getAccessToken()

    const result = await fetch(`https://api.weixin.qq.com/cgi-bin/user/info?access_token=${accseeToken}&openid=${openid}&lang=zh_CN`)
    const data = await result.json()
    
    return data
}


// 服务号推送模板消息
export const pub_pushTemplateMsg = async function(openid, templateId, url, data) {
    const accseeToken = await pub_getAccessToken()
    const result = await fetch(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accseeToken}`, {
        method: 'post',
        body: JSON.stringify({
            touser: openid,
            template_id: templateId,
            url: url,
            data: data
        })
    })
    const data = await result.json()
    return data
}