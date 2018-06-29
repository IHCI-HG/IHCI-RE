
module.exports = function () {
    
    return function (req, res, next) {
        if (req.flash) {
            return next();
        } else {
            req.flash = _flash;
            next(); 
        }
    };
};

/**
 * 设置flash方法，用于redirect后获取重定向前保存的临时数据
 * @param  {[type]} key  
 * @param  {[type]} msgs key对应要保存的消息内容，此值不传入时，表示取key对应的消息内容返回
 * @return {Object}
 */
function _flash (key, msgs) {
    if (!this.rSession) {
        throw Error('req.flash() middleware require redis3x-session');
    }

    var flashArr = this.rSession.flash = this.rSession.flash || {};

    // 设置内容
    if (msgs && key) {
        flashArr[key] = msgs;

    // 获取内容
    } else if (key) {
        var re = flashArr[key];
        delete flashArr[key];
        return re || null;

    // 清空内容
    } else {
        this.rSession.flash = {};
    }
}