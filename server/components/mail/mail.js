var nodemailer = require('nodemailer');

// 创建一个SMTP客户端配置
var config = {
        host: 'smtp.163.com', 
        port: 25,
        auth: {
            user: '13416363790@163.com', //注册的邮箱账号
            pass: 'zcc163mail'  //邮箱的授权码，不是注册时的密码
        }
    };

// 创建一个SMTP客户端对象
var transporter = nodemailer.createTransport(config);

// 发送邮件
module.exports = async function (mail){
    try{
        const result = await transporter.sendMail(mail)
    }catch(error){
        return false
    }
    return true      
};