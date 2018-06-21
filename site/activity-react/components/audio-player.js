import Detect from './detect';
import fetch from 'isomorphic-fetch';
import { autobind } from 'core-decorators';
import { encode, stringify } from 'querystring';

let count = 0;

const INIT = 'INIT';
const PLAYING = 'PLAYING';
const PAUSE = 'PAUSE';
const LOADING = 'LOADING';
const ERROR = 'ERROR';
const END = 'END';

@autobind
export class AudioPlayer {
    constructor(id) {
        if (id) {
            this.__firstAudioEl = document.getElementById(id);
        } else {
            this.__firstAudioEl = this.__creatAudio();
        }

        this.__secondAudioEl = this.__creatAudio();

        this.__playSrc = "";
        this.__preLoadSrc = "";
        this.__firstAudioEl.wxReady = false;
        this.__secondAudioEl.wxReady = false;

        this.__firstAudioEl.addEventListener('error', this.__audioError, false);
        this.__firstAudioEl.addEventListener('ended', this.__audioEnded, false);
        this.__secondAudioEl.addEventListener('error', this.__audioError, false);
        this.__secondAudioEl.addEventListener('ended', this.__audioEnded, false);
        this.__firstAudioEl.addEventListener('pause', this.__audioPause, false);
        this.__secondAudioEl.addEventListener('pause', this.__audioPause, false);

        this.__currentAudio = this.__firstAudioEl;

        this.__events = new Map();
        this.__statu = INIT;
        this.__statuChangeCallbacks = new Map();


    }

    // 获取 currentTime
    get currentTime() {
        return this.__currentAudio.currentTime || null;
    }

    // 获取 duration
    get duration() {
        return this.__currentAudio.duration || null;
    }

    // 获取 volume
    get volume() {
        return this.__currentAudio.volume || null;
    }

    // 设置 currentTime
    set currentTime(value) {
        this.__currentAudio.currentTime = value || 0;
    }

    // 设置 volume
    set volume(value) {
        this.__currentAudio.volume = value || this.audioEl.volume;
    }

    // 获取 statu
    get statu() {
        return this.__statu;
    }

    // 绑定事件
    on(e, callback) {
        if (e === 'statuChange') {
            this.__statuChangeCallbacks.set(callback, callback);
            return;
        }
        this.__events.set(callback, (e) => {
            if (e.target !== this.__currentAudio) {
                return;
            } else {
                callback(e);
            }
        });
        const proxyCallback = this.__events.get(callback);


        this.__firstAudioEl.addEventListener(e, proxyCallback, false);
        this.__secondAudioEl.addEventListener(e, proxyCallback, false);
    }

    // 解绑事件
    off(e, callback) {

        if (e === 'statuChange') {
            const statusCallBack = this.__statuChangeCallbacks.get(callback);
            if (statusCallBack) {
                this.__statuChangeCallbacks.delete(statusCallBack);
            }
            return;
        }


        const proxyCallback = this.__events.get(callback);

        if (proxyCallback) {
            this.__firstAudioEl.removeEventListener(e, proxyCallback, false);
            this.__secondAudioEl.removeEventListener(e, proxyCallback, false);
            this.__events.delete(callback());
        }
    }

    play(src) {
        if (!src) {
            console.error('调用 play 方法需要需要传入 src');
            return;
        }
        // this.__setPlaySrc(src);
        this.__setPlaySrc(src);
        this.__setCurrentAudio();
        if (Detect.os.weixin) {
            console.log('in wx');
            this.__wxFixAutoPlay();
        } else {
            this.__play();
        }

    }

    // 跳转到指定时间
    seek(time) {
        this.__currentAudio.currentTime = time || 0;
    }

    // 暂停播放
    pause() {
        this.__currentAudio.pause();
        
    }

    // 恢复播放
    resume() {
        this.__setStatu(PLAYING);
        this.__currentAudio.play();
        this.__intervalStart();
    }

    // 预加载
    preLoad(src) {
        if (!src) {
            console.error('调用 preLoad 方法需要需要传入 src');
            return;
        }
        if (this.__isSrcEqual(src, this.__playSrc)){
            return;
        }
        this.__setPreLoadSrc(src);
        console.log('preloading',this.__preLoadSrc);
        this.__preLoadAudio().src = this.__preLoadSrc;
    }

    __setStatu(state){
        if (this.__statu === state) return;
        this.__statu = state;
        let arr = this.__statuChangeCallbacks.values();
        if(arr.length > 0){
            [...arr].forEach(callback => callback(state));
        }
        // [...this.__statuChangeCallbacks.values()].forEach(callback => callback(state));
    }

    __setCurrentAudio() {
        console.log('----------set current--------------');
         if (this.__isSrcEqual(this.__playSrc, this.__preLoadSrc)) {
            this.__changeCurrentAudio();
            this.__playSrc = this.__currentAudio.src;
            console.log(this.__currentAudio.src);
        } else {
            this.__currentAudio.src = this.__playSrc;
            console.log(this.__currentAudio.src);
        }
    }

    // 私有play方法
    __play() {
        console.log('----------play--------------');
        console.log('played time: ', ++count);
        this.__setStatu(PLAYING);
        this.__currentAudio.play();
        this.__intervalStart();
    }

    __wxFixAutoPlay() {
        console.log('-----in-wx-fix-autoplay-----');
        if (this.__currentAudio.wxReady) {
            this.__play();
        } else {
            if (window.WeixinJSBridge) {
                WeixinJSBridge.invoke('getNetworkType', {}, (e) => {
                    console.log('wx-fix1');
                    this.__currentAudio.wxReady = true;
                    console.log(this.__currentAudio.wxReady);
                    this.__play();
                }, false);
            } else {
                document.addEventListener("WeixinJSBridgeReady", (e) => {
                    WeixinJSBridge.invoke('getNetworkType', {}, (e1) => {
                        console.log('wx-fix2');
                        this.__currentAudio.wxReady = true;
                        console.log(this.__currentAudio.wxReady);
                        this.__play();
                    });
                }, false);
            }
            this.__play();
        }
    }
    // 私有方法，音频错误降级处理
    __audioErrorHandle(e,msg,errorCode){
        let audioTempSrc = "";
        if (e.target === this.__currentAudio) {
            audioTempSrc = this.__playSrc || "";
        } else {
            audioTempSrc = this.__preLoadSrc || "";
        }
        /*音频播放失败，先转成aac或amr尝试使用http, 不行再用qiniu, 不行再用mp3,不行重试，再次失败则提交错误报告*/
        if (/(m4a)/.test(audioTempSrc)) {
            let audioType = ".aac";
            if (Detect.os.android) {
                audioType = ".amr";
            }
            audioTempSrc = audioTempSrc.replace(/(\.m4a)/gi, "") + audioType;
            console.log('1: .m4a 降级成 .acc / .amr');
        } else if (/(https\:)/.test(audioTempSrc) && /(amr|aac)/.test(audioTempSrc)) {
            audioTempSrc = audioTempSrc.replace("https:","http:");
            console.log('2: https 降级成 http');
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
        } else if (/(http\:)/.test(audioTempSrc) && /(amr|aac)/.test(audioTempSrc)){
            audioTempSrc = audioTempSrc.replace("http:","https:");
            audioTempSrc = audioTempSrc.replace(/(media\.qlchat\.com)|(qiniu\.qianliaowang\.com)/, "audio.qianliaowang.com").replace(/\.(amr|aac)/,"\.mp3");
            console.log('3: 降级使用audio.qianliaowang.com');
>>>>>>> 34489639a34bf3809a59fa7dedf402a6837210d2
>>>>>>> cd34279970900fc13cfc41acbe72568f9ea58418
        } else if (/(https\:)/.test(audioTempSrc) && /(\.mp3)/.test(audioTempSrc)){
            audioTempSrc = audioTempSrc.replace("https:","http:");
            console.log('4: 降级使用 http');
        } else if (!/(again)/.test(audioTempSrc)) {
            if (/(\?)/.test(audioTempSrc)) {
                // 音视频话题的地址是带参数的
                audioTempSrc = audioTempSrc+"&again="+(new Date()).getTime();
            } else {
                audioTempSrc = audioTempSrc+"?again="+(new Date()).getTime();
            }
            console.log('5: 降级失败，加入again标识');
        } else {
            console.log
            if (e.target === this.__currentAudio) {
                window.toast("音频加载失败，请稍后重试");
                this.__reportAudioError(e,msg,errorCode);
            }
            return;
        }

        if (e.target === this.__currentAudio) {
            this.__retryPlay(audioTempSrc);
        } else {
            this.__retryPreLoad(audioTempSrc);
        }
    }

    // 音频播放错误提交日志
	__reportAudioError(e,msg,errorCode) {
		let _url = e.currentTarget.currentSrc ;
		let _status = errorCode;
        let body = {
				url: _url,
				status: _status,
				errorCodeMsg:msg,
			};
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======

        fetch(`//stat.corp.qlchat.com/media.gif?${encode(body)}`, {
            method:'GET',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8',
            },
            credentials: 'include',

        });
>>>>>>> 34489639a34bf3809a59fa7dedf402a6837210d2
>>>>>>> cd34279970900fc13cfc41acbe72568f9ea58418
	}

    // 私有方法，在音频错误处理函数
    __audioError(e) {
        let errorCodeMsg;
        let errorCode;
        this.__intervalStop();
        if (e.target === this.__currentAudio) {
            errorCode = this.__currentAudio.error.code;
            this.__setStatu(ERROR);
        } else {
            errorCode = this.__preLoadAudio().error.code;
        }
        switch(errorCode){
            case 1: errorCodeMsg = "1: MEDIA_ERR_ABORTED - 取回过程被用户中止"; break;
            case 2: errorCodeMsg = "2: MEDIA_ERR_NETWORK - 当下载时发生错误"; break;
            case 3: errorCodeMsg = "3: MEDIA_ERR_DECODE - 当解码时发生错误"; break;
            case 4: errorCodeMsg = "4: MEDIA_ERR_SRC_NOT_SUPPORTED - 不支持音频/视频"; break;
        }
        if (this.__playSrc != '') {
            console.log("error : "+  errorCodeMsg);
            this.__audioErrorHandle(e, errorCodeMsg, errorCode);
        }

    }
    // 私有方法，在音频播放结束处理
    __audioEnded(e) {
        if (e.target === this.__currentAudio) {
            this.__setStatu(END);
            this.lastCurrentTime = NaN;
            this.__intervalStop();
        }

    }
    // 音频暂停处理机制-会泳
    __audioPause(e){
        this.__setStatu(PAUSE);
        this.__intervalStop();
    }
    __setPlaySrc(src) {
        // 首先尝试使用 aac / amr 格式播放
        // if (!/(\.mp3)/.test(src)) {
        //     let audioType = ".aac";
        //     if (Detect.os.android) {
        //         audioType = ".amr";
        //     }
        //     this.__playSrc = src.replace(/(\.\w+$)/gi, "") + audioType;
        // } else {
        //     this.__playSrc = src;
        // }
        // 首先尝试使用 m4a 格式播放
        if (!/(\.mp3)/.test(src) && !/(\.\w+$)/.test(src)) {
            this.__playSrc = src + ".m4a";
        } else if (!/(\.mp3)/.test(src)){
            this.__playSrc = src.replace(/(\.amr)|(\.aac)/gi, ".m4a");
        } else {
            this.__playSrc = src;
        }
    }

    __setPreLoadSrc(src) {
        // 首先尝试使用 aac / amr 格式播放
        // if (!/(\.mp3)/.test(src)) {
        //     let audioType = ".aac";
        //     if (Detect.os.android) {
        //         audioType = ".amr";
        //     }
        //     this.__preLoadSrc = src.replace(/(\.\w+$)/gi, "") + audioType;
        // } else {
        //     this.__preLoadSrc = src;
        // }
        // 首先尝试使用 m4a 格式播放
        if (!/(\.mp3)/.test(src) && !/(\.\w+$)/.test(src)) {
            this.__preLoadSrc = src + ".m4a";
        } else if (!/(\.mp3)/.test(src)) {
            this.__preLoadSrc = src.replace(/(\.amr)|(\.aac)/gi, ".m4a");
        } else {
            this.__preLoadSrc = src;
        }
    }

    __isSrcEqual(src1, src2) {
        if (src1 && src2) {
            const srcA = src1.replace(/(.+\.com|\.\w+$)/, "");
            const srcB = src2.replace(/(.+\.com|\.\w+$)/, "");
            return srcA === srcB;
        }
        return false;
    }

    __retryPlay(src) {
        this.__playSrc = src || '';
        this.__currentAudio.src = src || '';
        this.__setStatu(PLAYING);
        this.__currentAudio.play();
        this.__intervalStart();
    }

    
    __retryPreLoad(src) {
        this.__preLoadSrc = src || '';
        this.__preLoadAudio().src = src || '';
    }

    __creatAudio() {
        const audio = document.createElement("audio");
        audio.style.height = 0;
        audio.style.width = 0;
        audio.style.visibility = 'hidden';
        audio.preload = 'auto';
        document.body.appendChild(audio);
        return audio
    }

    __changeCurrentAudio() {
        if (this.__currentAudio === this.__firstAudioEl) {
            this.__currentAudio = this.__secondAudioEl;
        } else {
            this.__currentAudio = this.__firstAudioEl;
        }
    }

    __preLoadAudio() {
        if (this.__currentAudio === this.__firstAudioEl) {
            return this.__secondAudioEl;
        } else {
           return this.__firstAudioEl;
        }
    }

    // 计时器用来检测音频是否正常播放，如果卡住了则加0.1秒再继续播放。
    __intervalStart() {
        this.__intervalStop();
        this.__cheakCurrentTime = setInterval(() => {
            let currentTime = this.__currentAudio.currentTime;
            // console.log('currentTime:', currentTime, 'this.lastCurrentTime:',this.lastCurrentTime, 'status:', this.__statu);

            if ( this.__statu === END) {
                this.__intervalStop();
                return;
            }

            if (this.lastCurrentTime === currentTime && currentTime < this.__currentAudio.duration) {
                this.__setStatu(LOADING);
            } else {
                this.__setStatu(PLAYING);
            }

            if ( this.__statu === LOADING) {
                this.pause();
                let nextCurrentTime = Number((currentTime + 0.1).toFixed(3));
                this.seek(nextCurrentTime);
                setTimeout(() => {
                    this.resume();
                }, 100);
            }


            this.lastCurrentTime = currentTime || 0;
        }, 2000);
    }

    __intervalStop() {
        this.__cheakCurrentTime && clearInterval(this.__cheakCurrentTime);
    }
}
