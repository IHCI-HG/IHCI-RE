var IS_STATIC_RE = /^\/.*\.(html|css|js|json|png|jpeg|jpg|gif|bmp|handlebars|mp3|mp4|m3u8|avi|mpg|mpeg|xml|json)$/i,
    IS_JPG_RE = /\.(jpg|jpeg)$/i,
    IS_PNG_RE = /\.png$/i,
    IS_GIF_RE = /\.gif$/i,
    IS_IMG_RE = /\.(jpg|jpeg|png|gif)$/i,
    IS_CSS_RE = /\.css$/i,
    IS_JS_RE = /\.js$/i,
    IS_HTML_RE = /\.html$/i,
    IS_HBARS_RE = /\.handlebars$/i,
    IS_DIR_RE = /\/$/i;

// 判断是否是 JS 文件路径
function isJS(url) {
    return url && IS_JS_RE.test(url);
}

// 判断是否是 HTML 文件路径
function isHtml(url) {
    return url && IS_HTML_RE.test(url);
}

// 判断是否是图片路径
function isImg(url) {
    return url && IS_IMG_RE.test(url);
}

// 判断是否目录路径
function isDir(url) {
    return url && IS_DIR_RE.test(url);
}

// 判断是否是 css 文件路径
function isCss(url) {
    return url && IS_CSS_RE.test(url);
}

// 判断是否文件
function isStatic(url) {
    return url && IS_STATIC_RE.test(url);
}

// 请求过滤器
// 用于补充识别一些必要信息
function filter(req, res, next) {
    var parsedUrl = req._parsedUrl,
        pathname = parsedUrl.pathname,
        srcType = {
            'js': false,
            'html': false,
            'img': false,
            'css': false,
            'dir': false,
            'static': false
        };

    // 辨别请求资源类型
    if (isDir(pathname)) {
        srcType.dir = true;

    } else if (isStatic(pathname)) {
        srcType['static'] = true;

        if (isHtml(pathname)) {
            srcType.html = true;

        } else if (isJS(pathname)) {
            srcType.js = true;

        } else if (isImg(pathname)) {
            srcType.img = true;

        } else if (isCss(pathname)) {
            srcType.css = true;
        }
    }
    req.srcType = srcType;

    next();
}

module.exports = function () {
    return filter;
};