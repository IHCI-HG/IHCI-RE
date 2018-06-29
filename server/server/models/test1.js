const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const test1Schema = new mongoose.Schema({
    a:String,
    b:String,
    c:String,
    d:String,
    e:String
})

test1Schema.statics = {
    createTest1 : async function(a1,b1,c1){
        return this.create({a:a1,b:b1,c:c1});      
    },

    updateTest1 : async function(_id,obj){
        return this.update({_id:_id},obj);
    }

}

mongoose.model('test1', test1Schema);