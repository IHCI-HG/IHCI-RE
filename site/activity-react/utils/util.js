
/**
 * 格式化钱
 * @param amount {Number/String}   要格式化的数字
 * @param base   {Number}          格式化基数,默认为100
 * @returns {number}
 */
export function formatMoney(amount, base = 100) {
    if (base === 1) {
        return amount;
    }

    // 解决类似amount=1990时的精数不准问题
    if (parseInt(amount) === Number(amount)) {
        return Number(amount || 0) / base;
    }

    let money=(Math.floor(Number(amount || 0) / base * base) / base).toFixed(2);
    return money;
};

/**
 * 自动为数字添加加号(负数不加)
 * @param num
 * @return  String
 */
export function addPlus(num) {
    num = Number(num || 0);

    if (num > 0) {
        return '+' + num;
    }

    return String(num);
};

/**
 * 格格式输出日期串
 * @param date      {Number/Date}   要格式化的日期
 * @param formatStr {String}        格式串(yMdHmsqS)
 * @returns {*|string}
 */
export function formatDate(date, formatStr) {
    if (!date) {
        return '';
    }

    var format = formatStr || 'yyyy-MM-dd';

    if ('number' === typeof date || 'string' === typeof date) {
        date = new Date(+date);
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
    format = format.replace(/([yMdhmsqS])+/g, function (all, t) {
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

};

/**
 * 身份证号码校验
 * @param    {[type]}                cardNo [description]
 * @return   {[type]}                [description]
 * @datetime 2016-09-20T00:04:34+080
 * @author wangxiao<i@muyao.me>
 */
export function checkID(cardNo) {
    var info = {
        isTrue: false, // 身份证号是否有效。默认为 false
        year: null, // 出生年。默认为null
        month: null, // 出生月。默认为null
        day: null, // 出生日。默认为null
        isMale: false, // 是否为男性。默认false
        isFemale: false // 是否为女性。默认false
    };

    if (!cardNo || 18 != cardNo.length) {
        info.isTrue = false;
        return false;
    }

    var year = cardNo.substring(6, 10);
    var month = cardNo.substring(10, 12);
    var day = cardNo.substring(12, 14);
    var p = cardNo.substring(14, 17);
    var birthday = new Date(year, parseFloat(month) - 1, parseFloat(day));
    // 这里用getFullYear()获取年份，避免千年虫问题
    if (birthday.getFullYear() != parseFloat(year) ||
        birthday.getMonth() != parseFloat(month) - 1 ||
        birthday.getDate() != parseFloat(day)) {
        info.isTrue = false;
        return false;
    }

    var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1]; // 加权因子
    var Y = [1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2]; // 身份证验证位值.10代表X

    // 验证校验位
    var sum = 0; // 声明加权求和变量
    var _cardNo = cardNo.split("");

    if (_cardNo[17].toLowerCase() == 'x') {
        _cardNo[17] = 10; // 将最后位为x的验证码替换为10方便后续操作
    }
    for (var i = 0; i < 17; i++) {
        sum += Wi[i] * _cardNo[i]; // 加权求和
    }
    var i = sum % 11; // 得到验证码所位置

    if (_cardNo[17] != Y[i]) {
        return false;
    }

    info.isTrue = true;
    info.year = birthday.getFullYear();
    info.month = birthday.getMonth() + 1;
    info.day = birthday.getDate();

    if (p % 2 == 0) {
        info.isFemale = true;
        info.isMale = false;
    } else {
        info.isFemale = false;
        info.isMale = true;
    }
    return true;
}

/**
 * 从右至左混淆number的指定len位数(以*填充)
 * @param   {Number/String}   id
 * @param   {Number}          len 混淆的数字长度
 * @return  {string}
 */
export function mixId(id, len) {
    if (!id) {
        return '';
    }
    let idStr = String(id);
    len = len || 0;
    return idStr.substring(0, idStr.length - len) + ''.padStart(len, '*');
}

/**
 * 计算剩余天数
 * @param {Number/Date}   date      起始时间
 * @param {Number}        period    总天数
 * @returns {Number} 剩余天数
 */
export function dayLeft(date, period) {
    var timeNow = parseInt(new Date().getTime()),
        beginDate = 'object' === typeof date ? date : new Date(date),
        d = (timeNow - parseInt(beginDate.getTime())) / 1000,
        diff_days = Math.ceil(d / 86400);

    return period > diff_days ? period - diff_days : 0;
}

/**
 * 页面url跳转，延时150毫秒
 * @param  {[type]} url [description]
 * @return {[type]}     [description]
 */
export function locationTo(url) {
    setTimeout(() => {
        window.location.href = url;
    }, 150);
}

/**
 * 数字格式化成万或千
 * @param  {[type]} digit [description]
 * @param  {[type]} block [description]
 * @return {[type]}       [description]
 */
export function digitFormat(digit, block) {

    if ((digit === undefined) || (digit === '')) return 0;

    var format = parseInt(block) || 10000;

    digit = parseInt(digit);

    if (digit >= 1000 && digit < 10000 && format <= 1000) {

        digit = digit / 1000;

        digit = digit.toFixed(1) + '千';
        

    } else if (digit > 10000 && digit >= format) {

        digit = digit / 10000;

        digit = digit.toFixed(1) + '万';
        
    }

    return digit;
}

/**
 * 数字保留两位小数（只舍不入）
 * @param  {[type]} digit [description]
 * @return {[type]}       [description]
 */
export function digitFloor2(digit) {
    return Math.floor(digit * 100) / 100;
}

/**
 * 根据时间戳显示几天后开始的字符串
 * @param  {[type]} startTime [description]
 * @return {[type]}           [description]
 */
export const timeAfter = (startTime, nowTime) => {
    var timeNow = parseInt(new Date().getTime()),
        d = (parseInt(startTime) - (nowTime || timeNow)) / 1000,
        d_days = Math.floor(d / 86400),
        d_hours = Math.floor(d / 3600),
        d_minutes = Math.floor(d / 60);

    if (d_days > 0 /*&& d_days < 15*/) {
        return d_days + "天后";
    } else if (d_days <= 0 && d_hours > 0) {
        return d_hours + "小时后";
    } else if (d_hours <= 0 && d_minutes > 0) {
        return d_minutes + "分钟后";
    } else {
        return '进行中';
    }
}



/**
 * 根据时间戳显示几天后开始的字符串
 * @param  {[type]} startTime [description]
 * @return {[type]}           [description]
 */
export const timeAfterFix = (startTime, nowTime) => {

    var dateNow = new Date(),

        timeNow = Number(dateNow.getTime()),
        hoursNow = dateNow.getHours(),
        minutesNow = dateNow.getMinutes(),

        c = (23 - hoursNow) * 3600 + (60 - minutesNow) * 60,
        d = (Number(startTime) - (nowTime || timeNow)) / 1000,


        d_days = Number(d / 86400),
        d_hours = Number(d / 3600),
        d_minutes = Number(d / 60),

        c_days = Number((d - c) / 86400);

    if (c_days < 0) {
        return "今天"
    } else {
        if (c_days < 1) {
            return "明天"
        } else if (c_days > 1 && c_days < 2) {
            return "后天"
        } else {
            return (~~c_days + 1) + "天后"
        }
    }

}


/**
 * 根据时间戳显示多久前的字符串
 * @param  {[type]} pushTime [description]
 * @return {[type]}           [description]
 */
export const timeBefore = (pushTime, nowTime) => {

    var timeNow = parseInt(new Date().getTime()),
        d = ((nowTime || timeNow) - parseInt(pushTime)) / 1000,
        d_days = Math.floor(d / 86400),
        d_hours = Math.floor(d / 3600),
        d_minutes = Math.floor(d / 60);

    if (d_days > 30) {
        return formatDate(pushTime)
    } else if (d_days > 0 && d_days <= 30) {
        return d_days + "天前";
    } else if (d_days <= 0 && d_hours > 0) {
        return d_hours + "小时前";
    } else if (d_hours <= 0 && d_minutes > 0) {
        return d_minutes + "分钟前";
    } else {
        return '刚刚';
    }
}

export const isBeginning = (startTime, nowTime) => {

    var timeNow = parseInt(new Date().getTime()),
        d = (parseInt(startTime) - (nowTime || timeNow)) / 1000,
        d_days = parseInt(d / 86400),
        d_hours = parseInt(d / 3600),
        d_minutes = parseInt(d / 60);

    if (d_days > 0 || d_hours > 0 || d_minutes > 0) {
        return false;
    } else {
        return true;
    }
}
// 从iframe截取src值
export const getVieoSrcFromIframe = (iframeStr) => {
    let reg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;

    if (!iframeStr) {
        return '';
    }

    let matchs = iframeStr.match(reg);

    if (matchs && matchs.length > 1) {
        return matchs[1];
    }

    return '';
}

// 换行符处理
export const replaceWrapWord = (str) => {
    str = str || '';
    str = str.replace(/\</g, (m) => "&lt;");
    str = str.replace(/\>/g, (m) => "&gt;");
    return str.replace(/\n/g, (m) => '</br>');
}

export const dangerHtml = content => {
    return { __html: content };
};


export const parseDangerHtml = content => {

    content = content || '';

    if(typeof document != "undefined") {
        var output, elem = document.createElement('div');
        elem.innerHTML = content;
        output = elem.innerText || elem.textContent;
        return { __html: output.replace(/\n/g, (m) => '</br>') };
    } else {
        content = content.replace(/\&amp;/g, (m) => "&");
        return { __html: content.replace(/\n/g, (m) => '</br>') };
    }

};


export const noShifterParseDangerHtml = content => {

    content = content || '';

    if(typeof document != "undefined") {
        var output, elem = document.createElement('div');
        elem.innerHTML = content;
        output = elem.innerText || elem.textContent;
        return { __html: output};
    } else {
        content = content.replace(/\&amp;/g, (m) => "&");
        return { __html: content};
    }

};



/**
 * 过滤主要特殊字符
 * 注意：此方法的使用场景--过滤后的数据只在node或app展示，不在wt展示
 * @author dodomon
 * @param  {[type]} startTime [description]
 * @return {[type]}           [description]
 */
export const normalFilter = (sf) => {
    var sfData = sf || '';
    sfData = sfData.replace(/\</g, (m) => "&lt;");
    sfData = sfData.replace(/\>/g, (m) => "&gt;");
    sfData = sfData.replace(/\"/g, (m) => "&quot;");
    sfData = sfData.replace(/\'/g, (m) => "&#39;");
    sfData = sfData.replace(/(\u0085)|(\u2028)|(\u2029)/g, (m) => "");
    sfData = sfData.replace(/\%/g, (m) => "%25");
    sfData = sfData.replace(/\+/g, (m) => "%2B");
    sfData = sfData.replace(/\#/g, (m) => "%23");
    sfData = sfData.replace(/\//g, (m) => "%2F");
    sfData = sfData.replace(/\?/g, (m) => "%3F");
    sfData = sfData.replace(/\=/g, (m) => "%3D");
    sfData = sfData.replace(/\&/g, (m) => "%26");
    return sfData;
};

export const simpleFilter = (sf) => {
    var sfData = sf || '';
    sfData = sfData.replace(/(\u0085)|(\u2028)|(\u2029)/g, (m) => "");
    sfData = sfData.replace(/\%/g, (m) => "%25");
    sfData = sfData.replace(/\+/g, (m) => "%2B");
    sfData = sfData.replace(/\#/g, (m) => "%23");
    sfData = sfData.replace(/\//g, (m) => "%2F");
    sfData = sfData.replace(/\?/g, (m) => "%3F");
    sfData = sfData.replace(/\=/g, (m) => "%3D");
    return sfData;
};

export const htmlTransfer = (sf) => {
    var sfData = sf || '';
    sfData = sfData.replace("&lt;", (m) => "<");
    sfData = sfData.replace("&gt;", (m) => ">");
    return sfData;
};

export  const htmlTransferGlobal = (sf) => {
    var sfData = sf || '';
    sfData = sfData.replace(/&lt;/g, (m) => "<");
    sfData = sfData.replace(/&gt;/g, (m) => ">");
    return sfData;
}; 

/**
 * 根据时间戳显示周几的字符串
 * @param  {[type]} startTime [description]
 * @return {[type]}           [description]
 */
export const formateToDay = (startTime, nowTime) => {
    var timeNow = nowTime || parseInt(new Date().getTime()),
        d_days = Math.abs((startTime - timeNow) / 1000);
    var timeDay = new Date(startTime).getDay();
    if (d_days >= 0 && d_days <= 86400 && (timeDay === new Date().getDay())) {
        return "今天";
    } else {
        switch (timeDay) {
            case 1: return "周一"; break;
            case 2: return "周二"; break;
            case 3: return "周三"; break;
            case 4: return "周四"; break;
            case 5: return "周五"; break;
            case 6: return "周六"; break;
            case 0: return "周日"; break;
            default: ; break;
        }
    };
};

/**
 * 判断是今天、明天、或者后天
 * @param  {[type]} startTime [description]
 * @return {[type]}           [description]
 */
export const dateJudge = (judgeTime, nowTime) => {
    var todayTimeStamp = 0
    if(nowTime) {
        todayTimeStamp = parseInt(new Date(new Date(nowTime).setHours(0,0,0,0)).getTime())
    } else {
        todayTimeStamp = parseInt(new Date(new Date().setHours(0,0,0,0)).getTime())
    }

    var timeStamp1 = todayTimeStamp + 86400000
    var timeStamp2 = timeStamp1 + 86400000
    var timeStamp3 = timeStamp2 + 86400000

    var timeBeJudge = parseInt(judgeTime)

    if(timeBeJudge < todayTimeStamp) {
        return "今天以前"
    } else if(timeBeJudge >= todayTimeStamp && timeBeJudge < timeStamp1 ){
        return "今天"
    } else if(timeBeJudge >= timeStamp1 && timeBeJudge < timeStamp2 ){
        return "明天"
    } else if(timeBeJudge >= timeStamp2 && timeBeJudge < timeStamp3 ){
        return "后天"
    } else {
        return "后天以后"
    }
    
};

/**
 * 跟星期配合在一起的一个非常复杂的根据时间戳显示几天后开始的字符串
 * 这周到下周之内  显示本周几或下周几更新
 * 超过一周显示X天后更新
 * 其余时间保持原有逻辑不变
 * @param  {[type]} startTime [description]
 * @return {[type]}           [description]
 */
export const timeAfterMixWeek = (startTime, nowTime) => {
    var localTime = parseInt(new Date().getTime()),
        d = (parseInt(startTime) - (nowTime || localTime)) / 1000,
        d_days = Math.floor(d / 86400),
        d_hours = Math.floor(d / 3600),
        d_minutes = Math.floor(d / 60);

    var startTimeDay = new Date(startTime).getDay();
    var nowDay = new Date((nowTime || localTime)).getDay();

    startTimeDay = startTimeDay == 0 ? 7 : startTimeDay;
    nowDay = nowDay == 0 ? 7 : nowDay;

    var leftDay = 14 - nowDay
    var isCurrentWeek = d_days <= (leftDay - 7)

    var startTimeDayStr = ""
    switch (startTimeDay) {
        case 1: startTimeDayStr = "一" ; break;
        case 2: startTimeDayStr = "二" ; break;
        case 3: startTimeDayStr = "三" ; break;
        case 4: startTimeDayStr = "四" ; break;
        case 5: startTimeDayStr = "五" ; break;
        case 6: startTimeDayStr = "六" ; break;
        case 7: startTimeDayStr = "日" ; break;

        default: ; break;
    }

    if (d_days >= leftDay ) {
        return d_days + "天后";
    } else if (d_days <= leftDay && d_days > 0) {
        return isCurrentWeek ? "本周" + startTimeDayStr : "下周" + startTimeDayStr
    } else if (d_days <= 0 && d_hours > 0) {
        return d_hours + "小时后";
    } else if (d_hours <= 0 && d_minutes > 0) {
        return d_minutes + "分钟后";
    } else {
        return '进行中';
    }
}

export const updatePageData = () => {
    try {
        if (sessionStorage.getItem("isDataChange_B")) {
            var isDataChange_B = sessionStorage.getItem("isDataChange_B");
            sessionStorage.setItem("isDataChange_B", ++isDataChange_B);
        }
    } catch (e) {
    }
    return;
};
export const refreshPageData = () => {
    try {
        if (sessionStorage.getItem("isDataChange_A")) {
            var isDataChange_A = sessionStorage.getItem("isDataChange_A");
            var isDataChange_B = sessionStorage.getItem("isDataChange_B");
            if (isDataChange_A != isDataChange_B) {
                sessionStorage.setItem("isDataChange_A", isDataChange_B);
                window.location.reload(true);
            };
        } else {
            sessionStorage.setItem("isDataChange_A", 1);
            sessionStorage.setItem("isDataChange_B", 1);
        };
    } catch (e) {
        //TODO handle the exception
    };
    return;
};


export const isNumberValid = (inputNumber, minNum, maxNum, name) => {
    // 提示的信息
    let validMsg = {
        // 输入为空
        voidString: '输入不能为空',
        // 输入非正整数
        notAPositiveNumber: '请输入正整数',
        //输入正数（取到2位小数）
        notDecimal: '请输入两位小数的非负数',
        // 小于最小值
        lessOrMoreThanNum: '请输入' + minNum + '-' + maxNum + '的数',
    };
    if (inputNumber === '') {
        window.toast(name + ': ' + validMsg.voidString);
        return false;
    } else if ((!/^[1-9]+[0-9]*]*$/.test(inputNumber)) && inputNumber !== '0') {
        window.toast(name + ': ' + validMsg.notAPositiveNumber);
        return false;
    } else if (minNum && maxNum && (Number(inputNumber) < minNum || Number(inputNumber) > maxNum)) {
        window.toast(name + ': ' + validMsg.lessOrMoreThanNum);
        return false;
    } else {
        return true;
    }
};

/************************ 验证输入类型是否符合格式 - start ******************/
/**
 * @param {Object} validType-检验类型(text\money\name\password)
 * @param {Object} typeName-提示标题
 * @param {Object} inputVal-检验值
 * @param {Object} maxNum-最大值
 * @param {Object} minNum-最小值
 */
export const validLegal = (validType, typeName, inputVal, maxNum, minNum, spec_tips) => {
    var inputVal = inputVal.trim();
    var isPass = true;
    if (inputVal == "") {
        window.toast(typeName + "不能为空");
        return false;
    };
    switch (validType) {
        case "text": isPass = checkText(); break;
        case "money": isPass = checkMoney(); break;
        case "name": isPass = checkName(); break;
        case "password": isPass = checkPassword(); break;
        case "wxAccount": isPass = checkWxAccount(); break;
        case "phoneNum": isPass = checkPhoneNum(); break;
    };
    function checkText() {
        if (maxNum && inputVal.length > maxNum) {
            window.toast(typeName + "不能超过" + maxNum + "个字");
            return false;
        } else {
            return true;
        };
    };
    function checkMoney() {
        var tips = "";
        if (!/(^[0-9]*[\.]?[0-9]{0,2}$)/.test(inputVal)) {
            window.toast(typeName + "必须为非负数字,最多2位小数");
            return false;
        } else if (maxNum && Number(inputVal) > maxNum) {
            if (spec_tips && spec_tips != "") {
                tips += "，" + spec_tips;
            };
            window.toast(typeName + "不能超过" + maxNum + "元" + tips);
            return false;
        } else if (minNum && Number(inputVal) < minNum) {
            if (spec_tips && spec_tips != "") {
                tips += "，" + spec_tips;
            };
            window.toast(typeName + "不能小于" + minNum + "元" + tips);
            return false;
        } else {
            return true;
        };
    };
    function checkName() {
        if (!/(^[a-zA-Z]+$)|(^[\u4e00-\u9fa5]+$)/.test(inputVal)) {
            window.toast("请输入真实姓名");
            return false;
        } else if (maxNum && inputVal.length > maxNum) {
            window.toast(typeName + "不能超过" + maxNum + "个字");
            return false;
        } else {
            return true;
        };
    };
    function checkPassword() {
        if (!/^[0-9a-zA-Z]+$/.test(inputVal)) {
            window.toast(typeName + "只能是数字与字母组成");
            return false;
        } else if (maxNum && inputVal.length > maxNum) {
            window.toast(typeName + "最长为" + maxNum + "位");
            return false;
        } else {
            return true;
        };
    };
    function checkWxAccount() {
        if (!/^[0-9a-zA-Z\-\_]{5,30}$/.test(inputVal)) {
            window.toast("微信号仅6~30个字母，数字，下划线或减号组成");
            return false;
        } else {
            return true;
        };
    };
    function checkPhoneNum() {
        if (!/^1\d{10}$/.test(inputVal)) {
            window.toast("请输入正确的手机号");
            return false;
        } else {
            return true;
        };
    };
    return isPass;
};


/**
 * 图片格式化
 * @param {String} formatStrQ  阿里云的裁剪规格  例如："@96h_96w_1e_1c_2o"
 * @param {String} formatStrW  微信的裁剪规格 例如："/96"
 *
 * 默认裁剪尺寸是64
 */
export const imgUrlFormat = (url, formatStrQ = "?x-oss-process=image/resize,m_fill,limit_0,h_64,w_64", formatStrW = "/64") => {

    if (/(img\.qlchat\.com)/.test(url)) {
        url = url.replace(/@.*/, "") + formatStrQ;
    } else if (/(wx\.qlogo\.cn\/mmopen)/.test(url)) {
        url = url.replace(/(\/(0|132|64|96)$)/, formatStrW);
    };

    return url;
};


/**
 * 二维码弹框点击判断
 * @param {Event} e
 */
export const onQrCodeTouch = (e, selector, callback) => {
    const event = e.nativeEvent;
    const appDom = document.querySelector('#app');
    const qrConfirm = document.querySelector(selector);

    const qrHeight = qrConfirm.clientHeight;
    const qrWidth = qrConfirm.clientWidth;
    const appHeight = appDom.clientHeight;
    const appWidth = appDom.clientWidth;
    const pointX = event.changedTouches[0].clientX;
    const pointY = event.changedTouches[0].clientY;

    const top = (appHeight - qrHeight) / 2;
    const bottom = (appHeight - qrHeight) / 2 + qrHeight;
    const left = (appWidth - qrWidth) / 2;
    const right = (appWidth - qrWidth) / 2 + qrWidth;

    if (pointX > right || pointX < left || pointY > bottom || pointY < top) {
        callback();
    }
}

/**
 ** 加法函数，用来得到精确的加法结果
 **/
export function accAdd(arg1, arg2) {
    var r1, r2, m, c;
    try {
        r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
        r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
        var cm = Math.pow(10, c);
        if (r1 > r2) {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", "")) * cm;
        } else {
            arg1 = Number(arg1.toString().replace(".", "")) * cm;
            arg2 = Number(arg2.toString().replace(".", ""));
        }
    } else {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
}


// 乘法
export const mul = (arg1, arg2) => {
    var m = 0,
        s1 = arg1.toString(),
        s2 = arg2.toString();

    try {
        m += s1.split(".")[1].length
    } catch (e) { }
    try {
        m += s2.split(".")[1].length
    } catch (e) { }

    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
}

/**
 *
 * 获取cookie
 * @param {any} c_name
 * @returns
 */
export const getCookie = (c_name) => {
    if (document.cookie.length > 0) {
        let c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            let c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return decodeURIComponent(document.cookie.substring(c_start, c_end));
        };
    };
    return "";
}

/**
* 添加cookie
*
* @param {any} c_name
* @param {any} value
* @param {any} expiredays
*/
export const setCookie = (c_name, value, expiredays) => {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + "=" + encodeURIComponent(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + ";path=/";
}

/**
* 删除cookie
*
* @param {any} name
*/
export const delCookie = (name) => {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null) {
        document.cookie = name + "=" + cval + ";expires=" + 999 + "; path=/";
        document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString() + "; path=/";
    };
}

/**
 * 一个简单的字符串长度验证
 * 
 * @export
 * @param {string} val 字符串 
 * @param {number} [maxLength=10] 最大长度 
 * @param {number} [minLength=0] 最小长度
 * @returns 
 */
export function stringLengthValid(val, maxLength = 10, minLength = 1,name='') {
    if (!val.length || val.length < minLength) {
        window.toast(`${name}字数不够哦，最少${minLength}个字`, 1500)
        return false
    }
    if (val.length > 10) {
        window.toast(`${name}最多${maxLength}个字, 不可以再多了`, 1500)
        return false
    }
    return true
}

/**
 * 让代码停下来等一等
 *
 * @param {Number} time
 */
export const wait = (time) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		},time);
	});
};

/**
 * 获取对象的指定key值
 * eg: 
 *  var obj = {
 *      a:1,
 *      b:2,
 *      c:{
 *          d:3,
 *          e:[
 *              1,2,3
 *          ],
 *          f:[
 *              {
 *                  1:2
 *              }
 *          ]
 *      }
 *  };
 * 
 *  console.log(
 *      getVal(obj, 'a'),
 *      getVal(obj, 'c.d'),
 *      getVal(obj, 'c.e.1'),
 *      getVal(obj, 'c.f.0.1'),
 *      getVal(obj, 'c.f.f', 'haha'),
 *      obj
 *  )
 * @param {Object|Array} target 
 * @param {string} query 
 * @param {any} defaultValue 
 */
export function getVal(target, query, defaultValue) {
    if (target == null || (typeof target !== 'object' && !target instanceof Array)) {
        console.error('[getProperty]: target必须是Array或者Object，但是当前是' + target);
        return defaultValue;
    }

    if (typeof query !== 'string') {
        throw new Error('[getProperty]: query必须是string。')
    }

    const keys = query.split('.')
    let index = 0;
    let keysLen = keys.length;

    while (target != null && index < keysLen) {
        target = target[keys[index++]];
    }

    if (target == null) {
        return defaultValue;
    }

    return target;
}

/**
 * 
 * 排序
 * @param {any} attr 
 * @param {any} rev 
 * @returns 
 * @memberof StudioLiveMain
 */
export function sortBy(attr,rev){
    //第二个参数没有传递 默认升序排列
    if(rev ==  undefined){
        rev = 1;
    }else{
        rev = (rev) ? 1 : -1;
    }
    return function(a,b){
        a = a[attr];
        b = b[attr];
        if(a < b){
            return rev * -1;
        }
        if(a > b){
            return rev * 1;
        }
        return 0;
    }
}

// 为解决再安卓微信浏览器中window.location.reload(true);不触发刷新的问题写的兼容方法
export function updateUrl(url, key) {
    var key = (key || 't') + '=';  //默认是"t"
    var reg = new RegExp(key + '\\d+');  //正则：t=1472286066028
    var timestamp = +new Date();
    if (url.indexOf(key) > -1) { //有时间戳，直接更新
        return url.replace(reg, key + timestamp);
    } else {  //没有时间戳，加上时间戳
        if (url.indexOf('\?') > -1) {
            var urlArr = url.split('\?');
            if (urlArr[1]) {
                return urlArr[0] + '?' + key + timestamp + '&' + urlArr[1];
            } else {
                return urlArr[0] + '?' + key + timestamp;
            }
        } else {
            if (url.indexOf('#') > -1) {
                return url.split('#')[0] + '?' + key + timestamp + location.hash;
            } else {
                return url + '?' + key + timestamp;
            }
        }
    }
}

/**
 * 将一个数组存储到localStorage中
 * key 为 localStorage的key
 * item 塞入数组的对象
 * maxLength 为存储的数组的最大长度 如果不传则对长度不做限制
 * 超出最大长度的从头开始丢失数据，若原有长度超出最大长度，持续丢失数据到最大长度为止
 * @param {string} key 
 * @param {any} item 
 * @param {number} maxLength 
 */
export function saveLocalStorageArray(key, item, maxLength) {
    if( typeof key != "string" || (maxLength && typeof maxLength != "number") ) {
        console.err("saveLocalStorageArray 无效参数");
        return
    }
    if(!window || !window.localStorage || !JSON) {
        console.err("saveLocalStorageArray 无效的执行环境");
        return
    }
    var dataList = JSON.parse(window.localStorage.getItem(key)) || []

    while(dataList.length > 0 && dataList.length >= maxLength) {
        dataList.shift()
    }
    dataList.push(item)

    window.localStorage.setItem(key, JSON.stringify(dataList))

    return dataList
}
/**
 * 替换上面个LocalStorageArray中的某一条数据
 * 如果查不到这条数据，根据ifAdd为true是否就添加这条数据
 * maxLength控制数组长度
 * @param {string} localstorage 的key
 * @param {string} item 的key
 * @param {string} itemContent 的内容
 * @param {any} item 
 * 
 */
export function setLocalStorageArrayItem(localStorageKey, itemKey, itemContent, item, ifAdd, maxLength) {
    if( typeof localStorageKey != "string" || typeof itemKey != "string" || (maxLength && typeof maxLength != "number")) {
        console.err("setLocalStorageArrayItem 无效参数");
        return
    }
    if(!window || !window.localStorage || !JSON) {
        console.err("setLocalStorageArrayItem 无效的执行环境");
        return
    }
    var dataList = JSON.parse(window.localStorage.getItem(localStorageKey)) || []
    var i = 0
    var findData = false
    for(i; i < dataList.length; i++) {
        if(dataList[i][itemKey] == itemContent) {
            dataList[i] = item
            findData = true
        }
    }
    if(!findData && ifAdd === true) {
        while(dataList.length > 0 && dataList.length >= maxLength) {
            dataList.shift()
        }
        dataList.push(item)
    } 
    window.localStorage.setItem(localStorageKey, JSON.stringify(dataList))
    return dataList
}


/* 是否来自直播中心的判断 */
export function isFromLiveCenter() {
    if(window.sessionStorage) {
        return /recommend|subscribe-period-time|timeline|mine/.test(window.sessionStorage.getItem('trace_page'))
    }
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

/**
 * 生成随机id
 */
export function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
