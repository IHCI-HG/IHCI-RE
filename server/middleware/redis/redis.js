
const redis = require('redis')
const client = redis.createClient()

export const set = async (key,value)=>{
    client.set(key,value,function(err){
        console.log('Error:'+err)
    })
    client.expire(phoneNumber,7200)
}

export const get = async (key,callback) =>{
    await client.get(key,function(err,result){
        console.log(result)
        callback(result)
    })
   
}

export const del = async (key) =>{
    client.del(key,function(err){
        console.log('Error:'+err)
    })
}