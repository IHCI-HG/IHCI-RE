var Handlebars = require('handlebars');

Handlebars.registerHelper('textOverflow', function(text, length) {

    var length = parseInt(length);

    if(length && text.length > length){
        text = text.substring(0, length-1) + '...';
    }

    return text;
});
