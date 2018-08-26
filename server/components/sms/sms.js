
const SMSClient = require('@alicloud/sms-sdk')

var conf = require('../../conf')

const accessKeyId = conf.smsAppId
const secretAccessKey = conf.smsAppSe

let smsClient = new SMSClient({
    accessKeyId,
    secretAccessKey
})

export const sendNewSMS = async(phoneNumber,code)=>{
let randomCode = '' + (1000 + Math.ceil(Math.random() * 9000))
let resultCode = code?code:randomCode
const result = await smsClient.sendSMS({
    PhoneNumbers:phoneNumber,
    SignName:'智能人机交互实验室',
    TemplateCode:'SMS_142948470',
    TemplateParam:JSON.stringify({
        code:resultCode
    })
})
return resultCode

}


export const sendPwd = async(phoneNumber)=>{
    let randomPwd = '' + (10000000 + Math.ceil(Math.random() * 90000000))
    await smsClient.sendSMS({
        PhoneNumbers:phoneNumber,
        SignName:'智能人机交互实验室',
        TemplateCode:'SMS_142621947',
        TemplateParam:JSON.stringify({
            PhoneNumber:phoneNumber,
            Password:randomPwd
        })
    })
    return randomPwd

}
