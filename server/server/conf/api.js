var deepcopy = require('deepcopy');

var config = {

};

function fillApiPrefix(v, prefix) {
    if ('object' === typeof v) {
        for (var key in v) {
            if (key != 'secret') {
                v[key] = fillApiPrefix(v[key], prefix);
            }
        }
    } else if ('string' === typeof v) {
        v = prefix + v;
    }

    return v;
}

module.exports = config;
module.exports.getConf = function (apiPrefix, secretMap) {
    var copyConf = deepcopy(config);

    for (var key in apiPrefix) {
        copyConf[key] = fillApiPrefix(copyConf[key], apiPrefix[key]);
        if (!copyConf[key]) {
            copyConf[key] = {};
        }
        copyConf[key].secret = secretMap[key];
    }

    return copyConf;
};
