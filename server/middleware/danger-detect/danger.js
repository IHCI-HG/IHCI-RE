// 检测 XSS
function isXSS(req) {
    var url = req.originalUrl;
    if (url.indexOf('<') > -1 ||
        url.indexOf('%3C') > -1 ||
        url.indexOf('../') > -1) {
        return true;
    }
    return false;
}

exports.isXSS = isXSS;