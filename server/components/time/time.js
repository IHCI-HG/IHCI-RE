var YEAR_SEC = 365 * 24 * 60 * 60,
    MONTH_SEC = 30 * 24 * 60 * 60,
    DAY_SEC = 24 * 60 * 60,
    HOUR_SEC = 60 * 60,
    MINUTE_SEC = 60;
    
function string2seconds(string) {
    var rBlock = /(\d{1,4})([YMdhms])/,
        r,
        sec = 0;

    while ((r = rBlock.exec(string)) !== null) {
        var value = Number(r[1]),
            unit = r[2];
        if (unit === 'Y') {
            sec += YEAR_SEC * value;
        } else if (unit === 'M') {
            sec += MONTH_SEC * value;
        } else if (unit === 'd') {
            sec += DAY_SEC * value;
        } else if (unit === 'h') {
            sec += HOUR_SEC * value;
        } else if (unit === 'm') {
            sec += MINUTE_SEC * value;
        } else {
            sec += value;
        }
        string = string.replace(r[0], '');
    }

    return sec;
}


function dateFormat(date, format){

    if ('object' != typeof date) {
        date = new Date(date);
    }

    var map = {
        "M": date.getMonth() + 1, //月份 
        "d": date.getDate(), //日 
        "h": date.getHours(), //小时 
        "m": date.getMinutes(), //分 
        "s": date.getSeconds(), //秒 
        "q": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    format = format.replace(/([yMdhmsqS])+/g, function(all, t){
        var v = map[t];
        if(v !== undefined){
            if(all.length > 1){
                v = '0' + v;
                v = v.substr(v.length-2);
            }
            return v;
        }
        else if(t === 'y'){
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
}

exports.string2seconds = string2seconds;
exports.dateFormat = dateFormat;