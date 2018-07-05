var path = require('path')
var htmlProcessor = require('../../components/html-processor/html-processor')

module.exports = function () {
    return function (req, res, next) {
        const filePath = path.resolve(__dirname, '../../../public/activity-react/container.html');
        const options = {
            filePath,
            fillVars: {
                INIT_DATA: req.INIT_DATA || {}
            },
            renderData: {},
        };
        htmlProcessor(req, res, next, options)
    };
};
