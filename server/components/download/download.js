var mime = require('../mime/mime');


/**
 * 避免下载文件的文件名乱码
 * @param {Object} req
 * @param {Object} res
 * @param {String} filename 下载时的文件名
 * @param {[type]} options
 */
var avoidMessyFilename = function (req, res, filename, options) {
 
    var userAgent = (req.headers['user-agent'] || '').toLowerCase();
     
    if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
        res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));

    } else if (userAgent.indexOf('firefox') >= 0) {
        res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(filename)+'"');

    } else {
        /* safari等其他非主流浏览器只能自求多福了 */
        res.setHeader('Content-Disposition', 'attachment; filename=' + new Buffer(filename).toString('binary'));
    }
};

/**
 * 封装下载功能(支持按路径下载，按文件流buffer下载)
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 * @param  {Array}   options 配置项
 *     options.filename   下载时的文件名（带后缀)
 *     options.path       下载文件的路径（path存在时优先path下载）
 *     options.buffer     下载文件的文件流（在path字段不存在时，取buffer下载）
 *     options.callback   下载完成后的回调方法，按path下载时可用，buffer下载时不可用
 * @return {null}
 */
var download = function (req, res, next, options) {
    var filename = options.filename,
        mimeType;

    // 避免乱码
    avoidMessyFilename(req, res, filename);

    // 手动指定设置下载文件类型
    if (options.mimeType) {
        mimeType = options.mimeType;

    // 根据文件名自动识别文件类型
    } else {
        var reg = /\.([^.]*)$/,
            matchs = filename.match(reg);

        if (matchs && matchs.length > 1) {
            mimeType = mime[matchs[1].trim()];
        }
    }

    if (mimeType) {
        res.setHeader('Content-type', 'charset=UTF-8;' + (mimeType || ''));
    }

    // 按文件路径下载
    if (options.path) {
        res.download(options.path, filename, function (err) {
            if (options.callback) {
                options.callback(err);
            }
        });

    // 根据文件流下载
    } else if (options.buffer) {
        res.send(options.buffer);
    }
};

module.exports = download;
module.exports.avoidMessyFilename = avoidMessyFilename;