var Handlebars = require('handlebars');

Handlebars.registerHelper('time-status', function (startTime) {

    var timeNow = parseInt(new Date().getTime());
    var d = (parseInt(startTime) - timeNow) / 1000;
    var day = parseInt(d / 86400);
    var hour = parseInt(d / 3600);
    var min = parseInt(d / 60);

    if (day > 0) return day + '天后';
    if (hour > 0) return hour + '小时后';
    if (min > 0) return min + '分钟后';
    return '进行中';
});
