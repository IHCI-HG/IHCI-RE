
var ua = typeof window == 'undefined' ? '': (window.navigator.userAgent || '');

export function isAndroid() {
    return ua.indexOf('Android') > -1 || ua.indexOf('Linux') > -1;
}

export function isIOS() {
    return !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
}

export function isWeixin() {
    return ua.toLowerCase().match(/MicroMessenger/i) == "micromessenger";
}

export function isWeibo() {
    return ua.toLowerCase().match(/WeiBo/i) == "weibo"
}

export function isChrome() {
    return !!(typeof window != 'undefined' && window.chrome);
}

export function isFireFox() {
    return /firefox/i.test(ua.toLowerCase());
}

export function isPc() {
    return !isAndroid() && !isIOS()
}

<<<<<<< HEAD

=======
export function isQlchat() {
    return ua.toLowerCase().match(/qlchat/i) == "qlchat";
}

export function getQlchatVersion() {
    var qlver = ua.toLowerCase().match(/qlchat[a-zA-Z]*?\/([\d.]+)/);

    if (qlver && qlver.length) {
        return parseInt(qlver[1]);
    }

    return;
}
>>>>>>> 34489639a34bf3809a59fa7dedf402a6837210d2
