var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

import apiAuth from '../components/auth/api-auth'

import {
    createTopicTemplate,
    replyTopicTemplate
} from '../components/wx-utils/wx-utils'

var mongoose = require('mongoose')

var test1DB = mongoose.model('test1')



const test1Create = async (req,res,next)=>{
    var a1 = req.body.a;
    var b1 = req.body.b;
    var c1 = req.body.c;
    const result = test1DB.createTest1(a1,b1,c1);
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            result,
        }
    });
}

const test1Update = async(req,res,next)=>{
    var obj = req.obj.toObject();
    const result = test1DB.updateTest1(req._id,obj);
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            result,
        }
    });
}

module.exports = [
    ['POST', '/api/test1Create', test1Create],
    ['POST','/api/test1Update',test1Update],

];
