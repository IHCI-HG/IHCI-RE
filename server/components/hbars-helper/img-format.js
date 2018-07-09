var Handlebars = require('handlebars');

Handlebars.registerHelper('img-format', function(url, formatStr) {
    var domain = 'www.animita.com';

    // 阿里云域下的图片格式化只需添加后缀
    if ('string' === typeof url && url.indexOf(domain) > 0) {
        return url + (formatStr || '');
    }

    return url;

});