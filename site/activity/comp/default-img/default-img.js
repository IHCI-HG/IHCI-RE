var Handlebars = require('handlebars');

Handlebars.registerHelper('img-empty', function(type) {

    if (type === 'hot') {
        return __uri('./img/hot.png');
    }

    return __uri('./img/empty.png');

});