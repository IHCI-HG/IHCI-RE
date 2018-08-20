var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

import apiAuth from '../components/auth/api-auth'
var sendMail = require('../components/mail/mail')
var mongoose = require('mongoose')
var UserDB = mongoose.model('user')

const randomChar = function() {
    var x="0123456789qwertyuioplkjhgfdsazxcvbnm";
    var tmp="";
    var timestamp = new Date().getTime();
    for(var  i=0;i<13;i++)  {
       tmp += x.charAt(Math.ceil(Math.random()*100000000)%x.length);
    }
    return timestamp+tmp;
 }

const activation = async (req, res, next) => {
    const userId = req.rSession.userId
    const mailAccount = req.body.mailAccount
    const mailCode = randomChar()
    const result = await UserDB.findByIdAndUpdate({_id: userId}, {mailCode: mailCode, mailLimitTime: Date.now()+600*1000 }, {new: true})
    var mail = {
        // 发件人
        from: 'ICHI <' + conf.mail.auth.user + '>',
        // 主题
        subject: '激活您在IHCI平台上的账号',
        // 收件人
        to: mailAccount, //发送给注册时填写的邮箱
        text: '请勿回复 , 进入这个链接激活你的邮件 ：' + conf.mailOrigin+'/activate?userId='+ userId +'&mailCode='+ mailCode
    };
       const sendFlag = await sendMail(mail)
       if(sendFlag){
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg:"成功"},
            data: {}
                   });
       }else{
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg:"失败"},
            data: {}
                   });
       }
}

const sendManual = async (req, res, next) => {
    const userId = req.rSession.userId
    const mailAccount = req.body.mailAccount
    const mailCode = randomChar()
    const result = await UserDB.findByIdAndUpdate({_id: userId}, {mailCode: mailCode, mailLimitTime: Date.now()+600*1000 }, {new: true})
    var mail = {
        // 发件人
        from: 'ICHI <' + conf.mail.auth.user + '>',
        // 主题
        subject: '欢迎使用IHCI平台',
        // 收件人
        to: mailAccount, //发送给注册时填写的邮箱
        text: '下面为您介绍IHCI平台的相关信息和使用说明：....'
    };
       const sendFlag = await sendMail(mail)
       if(sendFlag){
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg:"成功"},
            data: {}
                   });
       }else{
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg:"失败"},
            data: {}
                   });
       }
}

const checkCode = async (req, res, next) => {
    const userId = req.body.userId;
    const mailCode = req.body.mailCode;
    const user = await UserDB.findByUserId(userId)

    if (user.mailCode === mailCode && (user.mailLimitTime - Date.now()) > 0){
        if(user.isLive==false){
            const result = await UserDB.findByIdAndUpdate({_id: userId}, {isLive: true}, {new: true})
            if(result){
                resProcessor.jsonp(req, res, {
                    state: { code: 0, msg:"激活成功"},
                    data: {}
                           });         
            }else{
                resProcessor.jsonp(req, res, {
                    state: { code: 1, msg:"激活失败"},
                    data: {}
                           });
            }

        }else{
            resProcessor.jsonp(req, res, {
                state: { code: 3, msg:"该邮箱已经激活"},
                data: {}
                       });
        }

    }else{
        resProcessor.jsonp(req, res, {
            state: { code: 2, msg:"激活失败,链接过期"},
            data: {}
                   });
    }

        
}

module.exports = [
    ['POST', '/api/activation', apiAuth, activation],
    ['POST', '/api/manual', apiAuth, sendManual],
    ['POST', '/api/checkCode', checkCode],
];
