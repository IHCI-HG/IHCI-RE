var nodemailer = require('nodemailer');
var conf = require('../../conf')

// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(conf.mail);

// 发送邮件
module.exports = async function (mail){
    try{
        const result = await transporter.sendMail(mail)
    }catch(error){
        console.error(error);
        return false
    }
    return true      
};