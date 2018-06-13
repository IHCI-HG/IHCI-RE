var Handlebars = require('handlebars');

Handlebars.registerHelper('status-show', function(startTime) {

    var timeNow = parseInt(new Date().getTime()),
        d = (parseInt(startTime) - timeNow) / 1000,
        d_days = parseInt(d / 86400),
        d_hours = parseInt(d / 3600),
        d_minutes = parseInt(d / 60);

    if (d_days > 0 /*&& d_days < 15*/ ) {
        return d_days + "天后";
    } else if (d_days <= 0 && d_hours > 0) {
        return d_hours + "小时后";
    } else if (d_hours <= 0 && d_minutes > 0) {
        return d_minutes + "分钟后";
    } else {
        return '进行中';
    }
});