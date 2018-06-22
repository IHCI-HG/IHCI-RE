var conf = require('../../conf')

import fetch from 'isomorphic-fetch';
import {redisPromiseGet, redisPromiseSet} from '../../middleware/redis-utils/redis-utils'

var mongoose = require('mongoose')
var userDB = mongoose.model('user')

/**
 * 格格式输出日期串
 * @param date      {Number/Date}   要格式化的日期
 * @param formatStr {String}        格式串(yMdHmsqS)
 * @returns {*|string}
 */
function formatDate(date, formatStr) {
    if (!date) {
        return '';
    }

    var format = formatStr || 'yyyy-MM-dd';

    if ('number' === typeof date || 'string' === typeof date) {
        date = new Date(+date);
    }

    var map = {
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes(), //分
        "s": date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;

};

// 网页登录，用 code 拿用户的 access_token (包括openid 和 unionid)
export const web_codeToAccessToken = async function(code) {
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
export const web_codeToUserInfo = async function(code) {
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


// 服务号推送模板消息通用方法
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
    const resultJson = await result.json()
    return resultJson
}

// 创建讨论-事务进度提醒消息
// openId 可以是array

// XXX 创建了讨论
// 1事务标题：topicName
// 2提醒时间：topicObj.createTime
// 3进度信息：XXX 创建了讨论
// 点击参与讨论
// 点击: /discuss/topic/+topicId
export const createTopicTemplate = async function(userIdList, topicObj) {
    const openidList = await userDB.openidList(userIdList)

    openidList.map((item) => {
        if(typeof item.openid == 'string') {
            pub_pushTemplateMsg(
                item.openid, 
                'p6pZBXX0SaqODRDZgY_3NqyIAK0mYN9HXYq6yMLyA04', 
                'http://www.animita.cn/team/discuss/topic/' + topicObj._id,
                {
                    "first": {
                        "value": topicObj.creator.name + " 创建了讨论",
                    },
                    "keyword1":{
                        "value": topicObj.title,
                    },
                    "keyword2": {
                        "value": formatDate(new Date()),
                    },
                    "keyword3": {
                        "value": topicObj.content,
                    },
                    "remark":{
                        "value": "点击查看",
                    }
                }
            )
        }
    })
}

// 回复讨论-事务进度提醒消息
// openId 可以是array

// XXX 创建了讨论
// 1事务标题：discussObj.title
// 2提醒时间：topicObj.createTime
// 3进度信息：XXX 创建了讨论
// 点击参与讨论
// 点击: /discuss/topic/+topicId
export const replyTopicTemplate = async function(userIdList, discussObj) {
    const openidList = await userDB.openidList(userIdList)

    openidList.map((item) => {
        if(typeof item.openid == 'string') {
            pub_pushTemplateMsg(
                item.openid, 
                'p6pZBXX0SaqODRDZgY_3NqyIAK0mYN9HXYq6yMLyA04', 
                'http://www.animita.cn/team/discuss/topic/' + discussObj.topicId,
                {
                    "first": {
                        "value": discussObj.creator.name + " 回复了讨论",
                    },
                    "keyword1":{
                        "value": discussObj.title,
                    },
                    "keyword2": {
                        "value": formatDate(new Date()),
                    },
                    "keyword3": {
                        "value": discussObj.content,
                    },
                    "remark":{
                        "value": "点击查看",
                    }
                }
            )
        }
    })
}

