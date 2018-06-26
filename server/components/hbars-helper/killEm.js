var Handlebars = require('handlebars');

Handlebars.registerHelper('killEm', function(text) {
    text = text.replace(/\<em\>/g, '');
    text = text.replace(/\<\/em\>/g, '');
    return text;
});
