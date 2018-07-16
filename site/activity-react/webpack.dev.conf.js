const fs = require('fs');
const del = require('del');
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const px2rem = require('postcss-px2rem');
const autoprefixer = require('autoprefixer');
const webpackStream = require('webpack-stream');
const WebpackUploadPlugin = require('webpack-upload');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');

// 将样式表抽离成专门的单独文件。这样，样式表将不再依赖于 JavaScript：
const ExtractTextPlugin = require('extract-text-webpack-plugin');

let MODE = process.env.BUILD_MODE || 'dev';

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: MODE === 'dev'
});


// console.log('-----------------当前模式：', `${MODE}`);

const entrys = {};
const htmlPlugins = [];
const pages = fs.readdirSync(path.join(__dirname, './pages'));
const PUBLIC_PATH = path.join(__dirname, '../../public/activity-react');

// -------------------- 各个环境配置
const config = {
    dev: {
        cssName: '[name].css',
        jsName: '[name].js',
        chunkFilename: '[name].[chunkhash:5].chunk.js',
        publicPath: '/activity-react/',
        devtool: 'inline-source-map',
    },
    test: {
        cssName: '[name].[contenthash].css',
        jsName: '[name].[chunkhash].js',
        publicPath: '/activity-react/',
        devtool: false,
        // assetsReceiver: 'http://receiver.dev1.qlchat.com/receiver',
        // assetsToDir: '/data/nodeapp/resources/rs'
    },
    prod: {
        cssName: '[name].[contenthash].css',
        jsName: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash:5].chunk.js',
        publicPath: '/activity-react/',
        devtool: false,
        // assetsReceiver: 'http://127.0.0.1:5001/receiver',
        // assetsToDir: '/data/res/activity/rs'
    }
}

// -------------------- 构建页面入口
pages.forEach(item => {
    if (/\.DS_Store/.test(item)) {
        return;
    }

    let page = path.join(__dirname, `./pages/${item}/index.js`);

    if (!fs.existsSync(page)) {
        page = path.join(__dirname, `./pages/${item}/index.tsx`);
    }

    if (!fs.existsSync(page)) {
        console.error(`无效页面${item} -- 找不到文件./pages/${item}/index.js 或 ./pages/${item}/index.ts`);
        return;
    }

    entrys[item] = page;

    // 默认用页面里面的index.html文件但模板，如果没有文件就用template.html
    if (fs.existsSync(path.join(__dirname, `./pages/${item}/index.html`))) {
        htmlPlugins.push(
            new HtmlWebpackPlugin({
                filename: `${item}.html`,
                template: path.join(__dirname, `./pages/${item}/index.html`),
                // chunks: [item, 'vendor']
                chunks: [item]
            })
        );
    } else {
        htmlPlugins.push(
            new HtmlWebpackPlugin({
                filename: `${item}.html`,
                template: path.join(__dirname, './template.html'),
                // chunks: [item, 'vendor']
                chunks: [item]
            })
        );
    }
})

// vendor配置
// entrys.vendor = ['babel-polyfill', 'react-dom'];
entrys.vendor = ['react-dom'];
// entrys.braft_editor_vendor = ['braft-editor'];

// console.log('entrys', entrys);

// -------------------- 构建plugins
let plugins = [
    ...htmlPlugins,
    new LiveReloadPlugin({
        appendScriptTag: true,
    }),
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
]

// let plugins = [
//     // 样式独立配置
//     new ExtractTextPlugin(config[MODE].cssName),
//     // 其他配置
//     new webpack.LoaderOptionsPlugin({
//         minimize: MODE !== 'dev',
//         sourceMap: MODE === 'dev',
//         options: {
//             postcss: function() {
//                 return [
//                     px2rem({
//                         remUnit: 75,
//                     }),
//                     autoprefixer({
//                         browsers: ['> 1%', 'Android >= 2.1', 'ios 7', 'firefox >= 15'],
//                     })
//                 ];
//             }
//          }
//     }),

//     // 公共库会被抽离到vendor.js里
//     // 升级webpack后就不能用CommonsChunkPlugin了，被config.optimization.splitChunks所替代
//     // new webpack.optimize.CommonsChunkPlugin({
//     //     names: ['braft_editor_vendor', 'vendor'],
//     //     deepChildren: true,
//     //     async: true,
//     //     minChunks: Infinity,
//     // }),


//     ...htmlPlugins
// ];

// if (MODE !== 'dev') {
//     const prodPlugins = [
//         new webpack.DefinePlugin({
//             // 定义生产环境
//             "process.env": {
//                 NODE_ENV: JSON.stringify("production")
//             }
//         }),

//         new webpack.optimize.UglifyJsPlugin({
//             // 最紧凑的输出
//             beautify: false,
//             compress: {
//                 // 在UglifyJs删除没有用到的代码时不输出警告
//                 warnings: false,
//                 // 删除所有的 `console` 语句
//                 // 还可以兼容ie浏览器
//                 // drop_console: true,
//                 // 内嵌定义了但是只用到一次的变量
//                 collapse_vars: true,
//                 // 提取出出现多次但是没有定义成变量去引用的静态值
//                 reduce_vars: true,
//             },
//             // comments: /\/\*.*\*\//
//         }), // 版本上线时开启

//         // 允许错误不打断程序
//         new webpack.NoEmitOnErrorsPlugin(),

//         // 静态资源实现cdn上传
//         // new WebpackUploadPlugin({
//         //     receiver: config[MODE].assetsReceiver,
//         //     to: config[MODE].assetsToDir
//         // }),
//     ];
    
//     plugins = plugins.concat(prodPlugins);
// } else {
//     const prodPlugins = [
//         new LiveReloadPlugin({
//             appendScriptTag: true,
//         }),
//     ];

//     plugins = plugins.concat(prodPlugins);
// }

module.exports = {
    mode: "development",
    entry: entrys,
    output: {
        path: PUBLIC_PATH,
        filename: config[MODE].jsName,
        chunkFilename: config[MODE].chunkFilename,
        publicPath: config[MODE].publicPath,
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader?cacheDirectory',
                    options: {
                        presets: ["es2015", 'stage-0', 'stage-1', 'stage-2', 'stage-3', 'react'],
                        plugins: ["transform-async-to-generator", 'transform-runtime']
                    }
                }
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [{
                    loader: "style-loader" // 将 JS 字符串生成为 style 节点
                }, {
                    loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
                }, {
                    loader: 'postcss-loader',  // 自动添加prefixer 和 将px转换为rem
                    options: {
                        plugins: () => [
                            require('autoprefixer')({
                            browsers: ['> 1%', 'Android >= 2.1', 'ios 7', 'firefox >= 15'],
                        }),
                        px2rem({
                            remUnit: 75,
                        }),
                    ]}
                },{
                    loader: "sass-loader" // 将 Sass 编译成 CSS
                }]
            },
            // {
            //     test: /\.scss$/,
            //     exclude: /node_modules/,
            //     use: extractSass.extract({
            //         use: [{
            //             loader: "css-loader"
            //         }, {
            //             loader: "sass-loader"
            //         }],
            //         // 在开发环境使用 style-loader
            //         fallback: "style-loader"
            //     })  
            // },
            {
                test: /\.(png|jpg|gif|ico|svg)$/,
                exclude: /node_modules/,
                use: 'url-loader?limit=8192&name=img/[name].[hash].[ext]'
            },
            {
                test: /\.json$/,
                exclude: /node_modules/,
                use: 'json-loader'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'file-loader',
                    options: {}
                }]
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: 'css-loader'
            }
        ]
    },
    plugins: plugins,
    devtool: config[MODE].devtool,
    resolve: {
        extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.js', '.jsx', '.ts', '.tsx'], // require 无需后缀
        modules: ['node_modules'],
        alias: {
            '@': path.resolve(__dirname, 'site')
        }
    },
}

// module.exports = {
//     entry: entrys,
//     output: {
//         path: PUBLIC_PATH,
//         filename: config[MODE].jsName,
//         chunkFilename: config[MODE].chunkFilename,
//         publicPath: config[MODE].publicPath,
//     },
//     module: {
//         loaders:
//         [
//             {
//                 test: /\.(ts|js)x?$/,
//                 exclude: /node_modules/,
//                 use: 'ts-loader',
//             },
//             {
//                 test: /\.scss$/,
//                 exclude: /node_modules/,
//                 use: ExtractTextPlugin.extract({
//                     fallback: "style-loader",
//                     use: [
//                         'css-loader?-autoprefixer',
//                         'postcss-loader',
//                         'sass-loader?outputStyle=expanded',
//                     ]
//                 })
//             },
//             {
//                 test: /\.(png|jpg|gif|ico|svg)$/,
//                 exclude: /node_modules/,
//                 use: 'url-loader?limit=8192&name=img/[name].[hash].[ext]'
//             },
//             {
//                 test: /\.json$/,
//                 use: 'json-loader'
//             },
//             {
//                 test: /\.(woff|woff2|eot|ttf|otf)$/,
//                 use: [
//                     'file-loader'
//                 ]
//             },
//             {
//                 test: /\.css$/,
//                 use: [
//                     'css-loader'
//                 ]
//             },

//         ]
//     },
//     resolve: {
//         extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.js', '.jsx', '.ts', '.tsx'], // require 无需后缀
//         modules: ['node_modules'],
//         alias: {
//             // '@': `${__dirname}site/activity-react`,
//             '@': path.resolve(__dirname, 'site')
//         }
//     },
//     devtool: config[MODE].devtool,
//     plugins: plugins,
//     devServer: {
//         historyApiFallback: true,
//     },
// }

