var conf = require('../../conf')
var sendMail = require('./mail')
var mongoose = require('mongoose')
var userDB = mongoose.model('user')

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

export const notificationMail = async function(userIdList, topicObj, type) {
    const personInfoList = await userDB.personInfoList(userIdList)
    console.log(personInfoList)
    personInfoList.map(async (item) => {
        if(item.personInfo.mail&&item.isLive) {
            var mail = {
                // 发件人
                from: 'ICHI <' + conf.mail.auth.user + '>',
                // 主题
                subject: '消息提醒',
                // 收件人
                to: item.personInfo.mail, 
                html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> \
                       <html xmlns="http://www.w3.org/1999/xhtml"><head> \
                       <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\
                       <meta name="viewport" content="width=device-width, initial-scale=1.0"></head>\
                       <body><table border="1" cellpadding="0" cellspacing="0">\
                       <tbody><tr><td><b>'+topicObj.creator.name+'</b>'+type+':&nbsp; '+topicObj.title+'</td> </tr>\
                       <tr><td><b>时间</b>：'+formatDate(new Date())+'</td></tr>\
                       <tr><td><b>内容</b>：'+topicObj.content+'</td></tr></tbody></table></body></html>'                                    
            };
            try{ 
                const sendFlag = await sendMail(mail)
                console.log("邮件发送状态：",sendFlag)
            }catch(error){
                console.log("错误")
            };                                     
        }        
    })
}
