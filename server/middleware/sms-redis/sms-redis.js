
const redis = require('redis')
const client = redis.createClient()

export const setSMS = async (phoneNumber,code)=>{
    client.set(phoneNumber,code,function(err){
        console.log('Error:'+err)
    })
    client.expire(phoneNumber,7200)
}

export const getSMS = async (phoneNumber,callback) =>{
    await client.get(phoneNumber,function(err,result){
        console.log(result)
        callback(result)
    })
   
}

export const delSMS = async (phoneNumber) =>{
    client.del(phoneNumber,function(err){
        console.log('Error:'+err)
    })
}