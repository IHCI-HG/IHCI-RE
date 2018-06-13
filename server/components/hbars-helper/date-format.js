var Handlebars = require('handlebars');

Handlebars.registerHelper('dateFormat', function(date, block) {

    if (!date) {
        return '';
    }

    var format = block || 'yyyy-MM-dd';

    date = new Date(Number(date));

    var map = {
        "M": date.getMonth() + 1, //月份
        "d": date.getDate(), //日
        "h": date.getHours(), //小时
        "m": date.getMinutes(), //分
        "s": date.getSeconds(), //秒
        "q": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        } else if (t === 'y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;

});

Handlebars.registerHelper('time-ago', function(publishTime) {
    var timeNow = parseInt(new Date().getTime()),
        d = (timeNow - parseInt(publishTime)) / 1000,
        d_days = parseInt(d / 86400),
        d_hours = parseInt(d / 3600),
        d_minutes = parseInt(d / 60);

    if (d_days > 0 /*&& d_days < 15*/ ) {
        return d_days + "天前";
    } else if (d_days <= 0 && d_hours > 0) {
        return d_hours + "小时前";
    } else if (d_hours <= 0 && d_minutes > 0) {
        return d_minutes + "分钟前";
    } else {
        // var s = new Date(publishTime * 1000);
        // s.getFullYear()+"年";
        // return (s.getMonth() + 1) + "月" + s.getDate() + "日";
        return '刚刚';
    }
});
