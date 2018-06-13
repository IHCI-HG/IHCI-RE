var Handlebars = require('handlebars');

Handlebars.registerHelper('digitFormat', function(digit, block) {

    if((digit === undefined) || (digit === '')) return 0;

    var format = parseInt(block) || 10000;

    digit = parseInt(digit);

    if(digit >= 1000 && digit < 10000 && format <= 1000){

        digit = digit / 1000;

        if(digit%1 !== 0){

            digit = digit.toFixed(1) + '千';
        }

    } else if (digit >= 10000 && digit >= format){

        digit = digit / 10000;

        if(digit%1 !== 0){
            digit = digit.toFixed(1) + '万';
        }
    }

    return digit;
});
