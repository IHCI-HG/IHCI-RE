var Handlebars = require('handlebars');

Handlebars.registerHelper('is-beginning', function(startTime, options) {

    var timeNow = parseInt(new Date().getTime()),
        d = (parseInt(startTime) - timeNow) / 1000,
        d_days = parseInt(d / 86400),
        d_hours = parseInt(d / 3600),
        d_minutes = parseInt(d / 60);

    if (d_days > 0 || d_hours > 0 || d_minutes > 0) {
       return options.inverse(this);
    } else {
       return options.fn(this);
    }
});