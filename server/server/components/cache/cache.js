var conf = require('../../conf'),
    lru = require('./lru');
    // mc = require('./mc'),
    // redis = require('./redis');
    
function local() {
    return lru();
}

// function remote() {
//     return mc();
// }

exports.local = local;
// exports.remote = remote;