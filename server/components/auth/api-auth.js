const resProcessor = require('../../components/res-processor/res-processor')

const apiAuth = (req, res, next) => {
    if(req.rSession.userId) {
        next()
    } else {
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请先登录' },
            data: {}
        });

        return
    }
}

module.exports = apiAuth