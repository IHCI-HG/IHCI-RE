// //////////////////////////目录设置-设置站点发布目录//////////////////////////
// 定义发布目录路径
fis.config.set('wwwPath', '../../public');

fis.set('project.ignore', ['node_modules/**', 'output/**', 'fis-conf.js', '**/_*.scss']);

// 拷贝favicon
fis.util.copy('../favicon.ico', fis.config.get('wwwPath') + '/favicon.ico', null);

// 默认部署方式-前端资源发布目录设置
fis.match('*', {
    deploy: fis.plugin('local-deliver', {
        to: fis.config.get('wwwPath'),
    }),
});

fis.match('*', {
    release: '/activity/$0',
});

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
// 使用cdn时开发调试部署-前端资源发布目录设置
fis.media('cdn_dev')
    .match('*.{js,css,jpg,png,jpeg,gif,ttf,eot,svg,woff}', {
        deploy: fis.plugin('http-push', {
            receiver: 'http://receiver.dev1.qlchat.com/receiver',
            to: '/data/nodeapp/resources/rs',
        }),
    })
    .match('*.{js,css,jpg,png,jpeg,gif,ttf,eot,svg,woff}', {
        domain: '//res.dev1.qlchat.com/rs',
    });

// 测试环境cdn配置
fis.media('cdn_test')
    .match('*.{js,css,jpg,png,jpeg,gif,ttf,eot,svg,woff}', {
        deploy: fis.plugin('http-push', {
            receiver: 'http://receiver.dev1.qlchat.com/receiver',
            to: '/data/nodeapp/resources/rs',
        }),
    })
    .match('*.{js,css,jpg,png,jpeg,gif,ttf,eot,svg,woff}', {
        domain: '//res.dev1.qlchat.com/rs',
    });

// 使用cdn线上部署-前端资源发布目录设置
fis.media('cdn_prod')
    .match('*.{js,css,jpg,png,jpeg,gif,ttf,eot,svg,woff}', {
        deploy: fis.plugin('http-push', {
            receiver: 'http://127.0.0.1:5001/receiver',
            to: '/data/res/activity/rs',
        }),
    })
    .match('*.{js,css,jpg,png,jpeg,gif,ttf,eot,svg,woff}', {
        domain: '//static.qianliaowang.com/activity/rs',
    });

>>>>>>> 34489639a34bf3809a59fa7dedf402a6837210d2
>>>>>>> cd34279970900fc13cfc41acbe72568f9ea58418

// ///////////////////////////资源处理配置///////////////////////////////////////

// npm install -g fis-parser-node-sass
fis.match('*.scss', {
    rExt: '.css', // from .scss to .css
    parser: fis.plugin('node-sass', {
        // fis-parser-sass option
    }),
});

// 加md5
fis.match('*.{js,css,png,jpg,scss}', {
    useHash: true,
});

// 开启js压缩
fis.match('*.js', {
    // fis-optimizer-uglify-js 插件进行压缩，已内置
    optimizer: fis.plugin('uglify-js', {
        compress: {
            // drop_console: true
        },
    }),
});

// 已压缩的文件不启用压缩
fis.match('**min*.{css,js}', {
    optimizer: null
});

fis.match('::package', {
    // fis-spriter-csssprites 插件 开启雪碧图合并
    spriter: fis.plugin('csssprites'),
});

// 插件配置
fis.match('::packager', {
    // npm install [-g] fis3-postpackager-loader
    // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
    postpackager: fis.plugin('loader', {
        resourceType: 'amd',
        allInOne: {
            js: '${filepath}_aio.js',
            css: '${filepath}_aio.css',
            includeAsyncs: true, // 包含异步加载的模块
            ignore: [
                // 稍微偏大的文件、常用的不合并，增加缓存利用率
                '/components_modules/zepto/1.1.6/zepto.js',
                '/components_modules/handlebars/3.0.3/handlebars.js',
                '/components_modules/aliyun/oss-sdk',
                '/components_modules/swiper/3.4.2/swiper.umd.js'
            ],
        },
        scriptPlaceHolder: '<!--SCRIPT_PLACEHOLDER-->',
        useInlineMap: true, // 资源映射表内嵌
    }),
});


/* 自动给 css 属性添加前缀，让标准的 css3 支持更多的浏览器.*/
fis.match('*.{css,less,scss}', {
  preprocessor: fis.plugin('autoprefixer', {
    'browsers': ['Android >= 2.1', 'iOS >= 4', 'ie >= 8', 'firefox >= 15'],
    'cascade': true,
  }),
});

// 开启对css中的图片合并
fis.match('*.{css, scss}', {
    useSprite: true,
    // fis-optimizer-clean-css 插件进行压缩，已内置
    optimizer: fis.plugin('clean-css', {
        baseDpr: 2,             // base device pixel ratio (default: 2)
        remVersion: true,       // whether to generate rem version (default: true)
        remUnit: 75,            // rem unit value (default: 75)
        remPrecision: 6,         // rem precision (default: 6)
    }),
});

/* 自动px转rem*/
fis.match('*css', {
    postprocessor: fis.plugin('px2rem'),
});

// 雪碧图合并的最小间隔
fis.config.set('settings.spriter.csssprites.margin', 5);

// 雪碧图拼合方式为矩形
fis.config.set('settings.spriter.csssprites.layout', 'matrix');

// 开启图片压缩
fis.match('*.png', {
    // fis-optimizer-png-compressor 插件进行压缩，已内置
    optimizer: fis.plugin('png-compressor'),
});

// 如果要兼容低版本ie显示透明png图片，请使用pngquant作为图片压缩器，
// 否则png图片透明部分在ie下会显示灰色背景
// 使用spmx release命令时，添加--optimize或-o参数即可生效
fis.config.set('settings.optimzier.png-compressor.type', 'pngquant');

// npm install -g fis-parser-handlebars-3.x
// 模板引擎配置
fis.match('**.handlebars', {
    rExt: '.js', // from .handlebars to .js 虽然源文件不需要编译，但是还是要转换为 .js 后缀
    parser: fis.plugin('handlebars-3.x', {
        // fis-parser-handlebars-3.x option
    }),
    release: false, // handlebars 源文件不需要编译
});


// ////////////////////////////模块化配置///////////////////////////////////////////
// 开启模块化开发
fis.hook('module', {
    mode: 'amd',
    // 把 factory 中的依赖，前置到 define 的第二个参数中来。
    forwardDeclaration: true,
    paths: {
        // 声明公用组件
        zepto: '/components_modules/zepto/1.1.6/zepto',
        zeptofix: 'components_modules/zepto/1.1.6/zepto-fx',
        tapon: '/components_modules/tapon/1.0.0/tapon',
        loading: '/components_modules/loading/2.0.0/loading',
        scrollload: 'components_modules/scroll-load/2.0.0/scroll-load',
        upscrollload: 'components_modules/scroll-load/1.0.0/scroll-load',
        store: '/components_modules/storage/1.0.0/storage',
        handlebars: '/components_modules/handlebars/3.0.3/handlebars.runtime',
        urlutils: '/components_modules/urlutils/1.0.0/urlutils',
        toast: '/components_modules/toast/1.0.0/toast',
        netstore: '/components_modules/net-store/1.0.0/net-store',
        lazyimg: '/components_modules/lazyimg/1.0.0/lazyimg',
        fastclick: '/components_modules/fastclick/1.0.6/fastclick',
        model: '/components_modules/model/1.0.0/model',
        model_101: '/components_modules/model/1.0.1/model',
        hbardateformat: '/components_modules/hbars-helper/1.0.0/date-format',
        hbarcompare: '/components_modules/hbars-helper/1.0.0/compare',
        hbardefaultVal: '/components_modules/hbars-helper/1.0.0/default-value',
        hbarimgformat: '/components_modules/hbars-helper/1.0.0/img-format',
        hbarmoneyformat: '/components_modules/hbars-helper/1.0.0/money-format',
        hbarstatusshow: '/components_modules/hbars-helper/1.0.0/status-show',
        hbarisbeginning: '/components_modules/hbars-helper/1.0.0/is-beginning',
        hbardigitformat: '/components_modules/hbars-helper/1.0.0/digit-format',
        touchslide: '/components_modules/touch-slide/1.1.0/touch-slide',
        appsdk: '/components_modules/app-sdk/1.0.0/app-sdk',
        tabbar: '/components_modules/tabbar/2.0.0/tabbar',
        envi: '/components_modules/envi/1.0.0/envi',
        wxutil: '/components_modules/wx-util/1.0.0/wx-util',
        wxutil_2: '/components_modules/wx-util/2.0.0/wx-util',
        inputmodal: 'components_modules/input-modal/1.0.0/input-modal',
        wechatLogin: 'components_modules/wechat-login/1.0.0/wechat-login',
        validator: 'components_modules/validator/1.0.0/validator',
        scrollload_v3: '/components_modules/scroll-load/3.0.0/scroll-load',
        dialog: '/components_modules/dialog/1.0.0/dialog',
        actionsheet: '/components_modules/action-sheet/1.0.0/action-sheet',
        payutil: '/components_modules/pay-util/1.0.0/pay-util',
        promise: '/components_modules/promise/6.0.2/promise',
        upload:'/components_modules/aliyun/1.0.0/oss-upload',
        swiper: '/components_modules/swiper/3.4.2/swiper.umd',
        swiperanimate: '/components_modules/swiper/3.4.2/swiper.animate.min',
        liveShareCard: '/components_modules/share-card/1.2.0/live-share-card',
        activitiesCard: '/components_modules/share-card/1.2.0/activity-card',
        teacherTopicComplite:'/components_modules/share-card/1.2.0/teacher-topic-card',
        studentTopicComplite:'/components_modules/share-card/1.2.0/student-topic-card',
    },
});

// 模块化文件配置
fis.match('*.js', {
    isMod: true,
});

// require.js本身不需要模块化，否则报错
fis.match('/components_modules/require/2.1.18/require.js', {
    isMod: false,
    useHash: false,
});


fis.match('/components_modules/qrcode/qrcode.min.js', {
    isMod: false,
    useHash: false,
});


fis.match('/components_modules/lib-flexible/1.0.0/lib-flexible.js', {
    isMod: false,
    useHash: false,
});

// /////////////////////////////开发、生产、调试环境区分配置/////////////////////////////////////////////////
fis.media('debug')
    .match('*.{js,css,png,scss}', {
        useHash: true,
        useSprite: false,
        optimizer: null,
    });
