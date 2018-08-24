const Promise = require('bluebird')
const redis = Promise.promisifyAll(require('redis'))
const client = redis.createClient()

export const set = async (key,value)=>{
    key = "sms:" + key
    client.set(key,value,function(err){
        console.log('Error:'+err)
    })
    client.expire(key,3600)
}


export const get = async (key) =>{
    key = "sms:"+ key
    return client.getAsync(key) 
}

async function getAsync (key) {
    return client.getAsync(key)
  }

export const del = async (key) =>{
    client.del(key,function(err){
        console.log('Error:'+err)
    })
}