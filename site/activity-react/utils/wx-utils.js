
import { fillParams } from './url-utils';
import { isIOS, isAndroid, getQlchatVersion} from './envi';

function copy(obj) {
    // JSON解析之类的其实如果给定格式不对很容易出错滴，自己做好检验~
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 微信分享（朋友、朋友圈、QQ、webbo、QQ空间）方法封装
 * @Author   fisher<wangjiang.fly.1989@163.com>
 * @DateTime 2016-11-25T11:09:38+0800
 * @param    {}    opts
 *     opts.title           分享标题
 *     opts.timelineTitle   朋友圈分享标题，为空时取opts.title
 *     opts.appTitle        朋友分享标题，为空时取opts.title
 *     opts.qqTitle         qq分享标题，为空时取opts.title
 *     opts.weiboTitle      weibo分享标题，为空时取opts.title
 *     opts.qzTitle         QZone分享标题，为空时取opts.title
 *
 *     opts.desc            分享描述
 *         注：不同平台描述和title配置方式类似：timelineDesc、appDesc、qqDesc、weiboDesc、qzDesc
 *     opts.shareUrl            分享的链接，为空时取当前页面完整url
 *     opts.imgUrl          分享的图片链接
 *     opts.successFn       分享成功后的回调方法
 *     opts.cancelFn        取消分享时的回调方法
 *     opts.extConfig       其他配置
 *
 *
 */
export function share(opts) {
    opts = opts || {};

    // 不指定分享链接时，默认取当前页地址
    if (!opts.shareUrl) {
        opts.shareUrl = window.location.href;
    }

    // Todo 根据需要可能要调整或去掉
    var newShareUrl = opts.shareUrl;
    // if (opts.shareUrl.indexOf('__sharem=1') > -1) {
    //     newShareUrl = opts.shareUrl;
    // } else {
    //     newShareUrl = opts.shareUrl.replace(/http[s]{0,1}\:\/\/m\.qlchat\.com/, 'http://v' + (Math.random() * 9).toFixed(0) + '.qianliao.tv');
    // }


    // 去掉重复参数以及state, code参数
    newShareUrl = fillParams({
        // _src: 'wx_share' // 标识为微信分享
    }, newShareUrl, ['code', 'state', 'loginType', 'authDataKey']);

    // 分享参数
    var shareOptions = {
            title: opts.title,
            desc: opts.desc,
            link: newShareUrl,
            imgUrl: opts.imgUrl,
            success: opts.successFn || function() {},
            cancel: opts.cancelFn || function() {}
        },
        shareAppOptons = copy(shareOptions),
        shareTimelineOptions = copy(shareOptions),
        shareQQOptions = copy(shareOptions),
        shareWeiboOptions = copy(shareOptions),
        shareQZoneOptions = copy(shareOptions);

	shareAppOptons.success = opts.successFn || function(){};
	shareTimelineOptions.success = opts.successFn || function(){};
    shareQQOptions.success = opts.successFn || function(){};
    shareWeiboOptions.success = opts.successFn || function(){};
    shareQZoneOptions.success = opts.successFn || function(){};

	shareAppOptons.cancel = opts.cancelFn || function(){};
	shareTimelineOptions.cancel = opts.cancelFn || function(){};
	shareQQOptions.cancel = opts.cancelFn || function(){};
	shareWeiboOptions.cancel = opts.cancelFn || function(){};
	shareQZoneOptions.cancel = opts.cancelFn || function(){};

    // 分享给朋友
    if (opts.appTitle) {
        shareAppOptons.title = opts.appTitle;
    }
    if (opts.appDesc) {
        shareAppOptons.desc = opts.appDesc;
    }


    // 分享到朋友圈
    if (opts.timelineTitle) {
        shareTimelineOptions.title = opts.timelineTitle;
    }
    if (opts.timelineDesc) {
        shareTimelineOptions.desc = opts.timelineDesc;
    }


    // 分享到QQ
    if (opts.qqTitle) {
        shareQQOptions.title = opts.qqTitle;
    }
    if (opts.qqDesc) {
        shareQQOptions.desc = opts.qqDesc;
    }

    // 分享到微博
    if (opts.weiboTitle) {
        shareWeiboOptions.title = opts.weiboTitle;
    }
    if (opts.weiboDesc) {
        shareWeiboOptions.desc = opts.weiboDesc;
    }

    // 分享到QQ空间
    if (opts.qzTitle) {
        shareQZoneOptions.title = opts.qzTitle;
    }
    if (opts.qzDesc) {
        shareQZoneOptions.desc = opts.qzDesc;
    }


    function _initSahreConfig() {
        if (typeof wx === 'undefined') {
            return;
        }
        wx.onMenuShareAppMessage(shareAppOptons);
        wx.onMenuShareTimeline(shareTimelineOptions);
        wx.onMenuShareQQ(shareQQOptions);
        wx.onMenuShareWeibo(shareWeiboOptions);
        wx.onMenuShareQZone(shareQZoneOptions);
        
        wx.showAllNonBaseMenuItem();

        if (opts.extConfig) {
            opts.extConfig(wx);
        }
    }

    // 手机平台
    if (isAndroid() || isIOS()) {
        typeof wx != 'undefined' && wx.ready(function() {
            _initSahreConfig();
        });

        // pc平台
    } else {
        setTimeout(function() {
            _initSahreConfig();
        }, 500);
    }
};


export function appShare(opts) {
    var ver = getQlchatVersion()
    if(ver && ver > 360) {
        window.qlchat.onMenuShareWeChatTimeline({
            type: "link", // "link" "image"
            content: opts.shareUrl, 
            title:  opts.timelineTitle,
            desc:  opts.timelineDesc,
            thumbImage:  opts.imgUrl 
        });
        window.qlchat.onMenuShareWeChatFriends({
            type: "link", // "link" "image"
            content: opts.shareUrl, 
            title:  opts.title,
            desc:  opts.desc,
            thumbImage:  opts.imgUrl 
        });
    }
}

export function closeShare() {
    typeof wx != 'undefined' && wx.ready(function () {
        wx.hideAllNonBaseMenuItem();
    });
};
