var Handlebars = require('handlebars');

Handlebars.registerHelper('money-format', function(money) {
    return parseInt(money) / 100;

});