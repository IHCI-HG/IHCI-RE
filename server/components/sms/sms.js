<<<<<<< HEAD

=======
>>>>>>> d2541709ec43996fc99da68cbfef7ef73787f6dc
const SMSClient = require('@alicloud/sms-sdk')

var conf = require('../../conf')

const accessKeyId = conf.smsAppId
const secretAccessKey = conf.smsAppSe

let smsClient = new SMSClient({
    accessKeyId,
    secretAccessKey
})

export const sendSMS = async(phoneNumber)=>{
let randomCode = '' + (1000 + Math.ceil(Math.random() * 9000))
console.log(phoneNumber)
console.log(randomCode)
const result = await smsClient.sendSMS({
    PhoneNumbers:phoneNumber,
    SignName:'智能人机交互实验室',
    TemplateCode:'SMS_142621688',
    TemplateParam:JSON.stringify({
        code:randomCode
    })
})
return randomCode


}
