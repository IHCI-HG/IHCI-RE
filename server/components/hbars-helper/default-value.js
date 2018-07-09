var Handlebars = require('handlebars');

/**
 * 默认值
 * @param  {[type]} imgCdnUrl [description]
 * @param  {[type]} url       [description]
 * @return {[type]}           [description]
 */
Handlebars.registerHelper('defaultVal', function(value, defaultVal) {
    return value ? value : defaultVal;
});
