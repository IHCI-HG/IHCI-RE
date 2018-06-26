var express = require('express'),

    conf = require('../../conf');

module.exports = function () {
    return express.static(conf.root, {
        maxAge: conf.mode === 'prod' ? 30 * 24 * 3600 * 1000 : 0,
        index: false,
        redirect: false
    });
};
