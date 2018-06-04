const fs = require('fs');
const del = require('del');
const gulp = require('gulp');
const glob = require('glob');
const webpack = require('webpack');
const named = require('vinyl-named');
const plumber = require('gulp-plumber');
const px2rem = require('postcss-px2rem');
const autoprefixer = require('autoprefixer');
const livereload = require('gulp-livereload');
const sourcemaps = require('gulp-sourcemaps');
const webpackStream = require('webpack-stream');
const WebpackUploadPlugin = require('webpack-upload');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

let MODE = 'dev';
const PUBLIC_PATH = '../../public/activity-react';
const config = {
    dev: {
        cssName: '[name].css',
        jsName: '[name].js',
        publicPath: '/activity-react/',
        devtool: 'inline-source-map',
    },
    prod: {
        cssName: '[name].[chunkhash].css',
        jsName: '[name].[chunkhash].js',
        publicPath: '//static.qianliaowang.com/frontend/rs/',
        devtool: false,
        assetsReceiver: 'http://127.0.0.1:5001/receiver',
        assetsToDir: '/data/res/frontend/rs'
    }
}

// 开发环境js编译
gulp.task('build', async () => {
    const pages = fs.readdirSync('./pages');
    const entrys = {};
    const htmlPlugins = [];

    pages.forEach(item => {
        entrys[item] = `./pages/${item}/index.js`

        // 默认用页面里面的index.html文件但模板，如果没有文件就用template.html
        if (fs.existsSync(`./pages/${item}/index.html`)) {
            htmlPlugins.push(
                new HtmlWebpackPlugin({
                    filename: `${item}.html`,
                    template: `./pages/${item}/index.html`,
                    chunks: [item]
                })
            );
        } else {
            htmlPlugins.push(
                new HtmlWebpackPlugin({
                    filename: `${item}.html`,
                    template: './template.html',
                    chunks: [item]
                })
            );
        }
    })

    let plugins = [
        new ExtractTextPlugin(config[MODE].cssName),
        new webpack.LoaderOptionsPlugin({
            minimize: MODE !== 'dev',
            sourceMap: MODE === 'dev',
            options: {
                postcss: function() {
                    return [
                        px2rem({
                            remUnit: 75,
                        }),
                        autoprefixer({
                            browsers: ['> 1%', 'Android >= 2.1', 'ios 7', 'firefox >= 15'],
                        })
                    ];
                }
             }
        }),
        ...htmlPlugins
    ];

    if (MODE !== 'dev') {
        const prodPlugins = [
            new webpack.DefinePlugin({
                // 定义生产环境
                "process.env": {
                    NODE_ENV: JSON.stringify("production")
                }
            }),

            new webpack.optimize.UglifyJsPlugin({
                // 最紧凑的输出
                beautify: false,
                compress: {
                    // 在UglifyJs删除没有用到的代码时不输出警告
                    warnings: false,
                    // 删除所有的 `console` 语句
                    // 还可以兼容ie浏览器
                    // drop_console: true,
                    // 内嵌定义了但是只用到一次的变量
                    collapse_vars: true,
                    // 提取出出现多次但是没有定义成变量去引用的静态值
                    reduce_vars: true,
                },
                // comments: /\/\*.*\*\//
            }), // 版本上线时开启

            // 允许错误不打断程序
            new webpack.NoEmitOnErrorsPlugin(),

            // 静态资源实现cdn上传
            new WebpackUploadPlugin({
                receiver: config[MODE].assetsReceiver,
                to: config[MODE].assetsToDir
            }),
        ];
        
        plugins = plugins.concat(prodPlugins);
    }

    const buildTask = gulp.src('./**/index.js')
        .pipe(webpackStream({
            entry: entrys,
            output: {
                filename: config[MODE].jsName,
                publicPath: config[MODE].publicPath,
            },
            module: {
                loaders: 
                [
                    {
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: 'babel-loader?cacheDirectory=true'
                    },
                    {
                        test: /\.scss$/,
                        exclude: /node_modules/,
                        use: ExtractTextPlugin.extract({
                            fallback: "style-loader",
                            use: [
                                'css-loader?-autoprefixer',
                                'postcss-loader',
                                'sass-loader?outputStyle=expanded',
                            ]
                        })
                    },
                    {
                        test: /\.(png|jpg|gif|ico|svg)$/,
                        exclude: /node_modules/,
                        use: 'url-loader?limit=8192&name=img/[name].[hash].[ext]'
                    }
                ]
            },
            devtool: config[MODE].devtool,
            plugins: plugins
        }))
        .pipe(gulp.dest(PUBLIC_PATH));
    
    if (MODE === 'dev') {
        buildTask.pipe(livereload());
    }
})

gulp.task('clean', () => {
    return del(PUBLIC_PATH, {
        force: true
    })
});


gulp.task('default', ['clean', 'build'], function () {
    livereload.listen({
        port: '5001',
        host: 'localhost',
        basePath: '/wechat/page/activity/',
        start: true
    });
    gulp.watch(['./**', '!gulpfile.js', '!.babelrc'], ['build']);
})

gulp.task('test', ['clean'], () => {
    MODE = 'test'
    gulp.run('build');
});

gulp.task('prod', ['clean'], () => {
    MODE = 'prod'
    gulp.run('build');
});
