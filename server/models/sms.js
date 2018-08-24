const mongoose = require('mongoose')
const conf = require('../conf')


const smsSchema = new mongoose.Schema({
    create_time: { type: String, default : Date.now},
    phoneNumber: { type: String , index: true },
    VerificationCode: { type: String}
})

smsSchema.statics = {
    createSMS: async function(phoneNumber, VerificationCode) {
        if(phoneNumber === null){
            return null
        }
        else{
            var result = await this.findOne({phoneNumber:phoneNumber}).exec()
        }
        
        if(result) {
            return null
        } else {
            return this.create({
                phoneNumber,
                VerificationCode,
                
            })
        }
    },
    verifyCode: async function(phoneNumber, VerificationCode) {
        const result = await this.findOne({phoneNumber: phoneNumber}).exec()
        if(result.VerificationCode === VerificationCode ) {
            const removeResult = await this.remove({ 
                phoneNumber,
                VerificationCode
             }).exec()
             return true
        } else {
            return false
        }
    },

}

mongoose.model('sms', smsSchema);
