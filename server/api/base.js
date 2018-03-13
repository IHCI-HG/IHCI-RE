var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');
import lo from 'lodash';

var mongoose = require('mongoose')
var UserDB = mongoose.model('user')

var sysTime = function(req, res, next) {
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime()
        }
    });
};

const login = async (req, res, next) => {
    const type = lo.get(req, 'body.type')

    // req.rSession.expires = 10;
    // req.rSession.noRobot = true;
    // req.rSession.count = req.rSession.count + 1 || 1

    req.rSession.user = req.rSession.user + 1 || 1

    console.log(req);

    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime(),
            rSession: req.rSession
        }
    });
}

const signUp = async (req, res, next) => {

    const result = await UserDB.createUser(
        Math.random().toString(),
        Math.random().toString(),
        {
            name: Math.random().toString(),
            phone: Math.random().toString(),
            mail: Math.random().toString(),
            wechat: Math.random().toString(),
            QQ: Math.random().toString(),
            headImgUrl: Math.random().toString(),
        }
    )
    
    console.log(result);

    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime(),
            result: result
        }
    });
}

const logOut = async (req, res, next) => {
    req.rSession.user = null
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime()
        }
    });
}

const updateHeadImgUrl = async (req, res, next) => {
    const result = await UserDB.updateHeadImgUrl(req.query.id || "5aa77aa0e71aa72584bdad44", Math.random().toString())

    if(result.ok == 1) {
        // 真的OK了
    } else {
        // 失败了
    }

    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime(),
            result: result,
        }
    });
}

const updateUserInfo = async (req, res, next) => {
    const result = await UserDB.updateHeadImgUrl(req.query.id || "5aa77aa0e71aa72584bdad44", Math.random().toString())

    if(result.ok == 1) {
        // 真的OK了
    } else {
        // 失败了
    }

    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime(),
            result: result,
        }
    });
}

module.exports = [
    ['GET', '/api/base/sys-time', sysTime],

    ['GET', '/api/login', login],
    ['POST', '/api/login', login],

    ['GET', '/api/sign-up', signUp],
    ['POST', '/api/sign-up', signUp],

    ['GET', '/api/logout', logOut],
    ['POST', '/api/logout', logOut],
    
    // todo 添加api router
    ['GET', '/api/update-head-img', updateHeadImgUrl],
    ['POST', '/api/update-head-img', updateHeadImgUrl],
    
    // todo 添加api router
    ['GET', '/api/update-head-img', updateUserInfo],
    ['POST', '/api/update-head-img', updateUserInfo],
];
