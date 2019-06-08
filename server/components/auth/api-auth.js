const resProcessor = require('../../components/res-processor/res-processor')
const crypto = require('crypto');

const serverAllowed = ['calendar'];
const generateCode = (serverName, timestamp) => {
    const secret = 'ihci';
    const hash = crypto.createHmac('sha256', secret)
        .update(`ihci${serverName}${timestamp}`)
        .digest('hex');
    return hash;
};


/**
 * this component is used to authorize the request
 * req.rSession.userId: if the user is login, req.rSession.userId is not empty.
 * req.body.authCode: request made by other servers (such as calendar) includes the authCode for authorize.
 *      authCode rules: SHA(timestamp + server name)
 *
 */
const apiAuth = (req, res, next) => {
    if(req.rSession.userId) {
        next()
    } else if (req.body.authCode) {
        const timestamp = Date.now() - Date.now()%60000;
        const previousTS = Date.now() - Date.now()%60000 - 60000;
        for (let i=0;i<serverAllowed.length;i++) {
            let server = serverAllowed[i];
            if (req.body.authCode === generateCode(server, timestamp) ||
                req.body.authCode === generateCode(server, previousTS)) {
                next();
                return;
            }
        }
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '识别码校验不通过'},
            data: {}
        });


    } else {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请先登录' },
            data: {}
        });

    }
}

module.exports = apiAuth
