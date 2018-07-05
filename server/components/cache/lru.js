var conf = require('../../conf'),

    LRU = require('lru-cache'),

    max = 500,
    maxAge = 60 * 60 * 1000,

    cache;

function init() {
    if (conf.lruMax) {
        max = conf.lruMax;
    }
    if (conf.lruMaxAge) {
        maxAge = conf.lruMaxAge;
    }

    cache = LRU({
        max: max,
        maxAge: maxAge
    });
}

module.exports = function () {
    if (!cache) {
        init();
    }
    return cache;
};