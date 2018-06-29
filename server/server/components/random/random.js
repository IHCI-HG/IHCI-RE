/**
 * 生成n位随机数字串
 * @param  {Number} n 产生随机数的位数
 * @return {String}   产生的随机数
 */
function randomNum (n) {
    var res = '';
    for (var i = 0; i < n; i++) {
        res += Math.floor(Math.random() * 10);
    }

    return res;
}


module.exports.randomNum = randomNum;