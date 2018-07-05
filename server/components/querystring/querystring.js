var qs = require('querystring');

/**
 * 将 URL 参数转换为字符串
 * @param {Mix} query1[, query2][, withouts]  处理参数
 *        @param {Array} withouts 要排除的字段
 * @return {String} 最后格式化完后的字符串
 * .eg
 *     query2string({'pf':'145','ss':'320x240'});
 *     query2string({'pf':'145','ss':'320x240'},['pf']);
 *     query2string({'pf':'145','ss':'320x240'},{'fr':'android'});
 *     query2string({'pf':'145','ss':'320x240'},{'fr':'android'},['fr']);
 */
function query2string() {
    var args = Array.prototype.slice.apply(arguments),
        string = '',
        withouts,
        lastIndex = args.length - 1,
        fields = [];

    // 检测是否有排除参数
    if (Array.isArray(args[lastIndex])) {
        withouts = args[lastIndex];
        args.pop();
    }

    // 需要生成的参数对象
    var qsObj = {};
    args.forEach(function (item) {
        Object.keys(item).forEach(function (key) {
            // 原有的逻辑不是相同的key替换，而是后面的key跟现有的有冲突时会被忽略掉
            if(!qsObj[key] && (!withouts || withouts.indexOf(key) === -1)) {
                qsObj[key] = item[key];
            }
        });
    });

    return qs.stringify(qsObj);
}

/**
 * 字符串转成参数对象
 * @param  {String} qString  参数字符串
 * @return {Object}          处理完的对象
 * .eg
 *     string2query('pf=145&ss=320x240');
 */
function string2query(qString) {
    return qs.parse(qString);
}

exports.query2string = query2string;
exports.string2query = string2query;