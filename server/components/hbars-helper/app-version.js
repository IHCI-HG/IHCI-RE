var Handlebars = require('handlebars');

Handlebars.registerHelper('app-version', function(version, system, androidVer, iosVer, options) {
    if (arguments.length < 5) {
        throw new Error('Handlerbars Helper "app-version" needs 4 parameters');
    }

    version = version || 0;
    system = system || '';
    androidVer = androidVer || 0;
    iosVer = iosVer || 0;

    var result = false;

    if(version === 0 || system === ''){
        result = true;
    } else {
        if(system === 'android'){
            result = version >= androidVer ? true : false;
        } else if (system === 'ios'){
            result = version >= iosVer ? true : false;
        } else {
            result = true;
        }
    }

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
