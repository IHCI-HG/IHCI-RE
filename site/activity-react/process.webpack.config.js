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
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// 将样式表抽离成专门的单独文件。这样，样式表将不再依赖于 JavaScript：
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.BUILD_MODE === 'dev'
});

let MODE = process.env.BUILD_MODE || 'dev';
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
        chunkCssname: '[name].[chunkhash:5].chunk.css',
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
        chunkCssname: '[name].[chunkhash:5].chunk.css',
        publicPath: '/activity-react/',
        devtool: false,
        // assetsReceiver: 'http://127.0.0.1:5001/receiver',
        // assetsToDir: '/data/res/activity/rs'
    }
}

// -------------------- 构建页面入口 
const constructPageEntry = (item, chunks) => {
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
                chunks: [item, ...chunks]
            })
        );
    } else {
        htmlPlugins.push(
            new HtmlWebpackPlugin({
                filename: `${item}.html`,
                template: path.join(__dirname, './template.html'),
                // chunks: [item, 'vendor']
                chunks: [item, ...chunks]
            })
        );
    }
}

constructPageEntry('container', ['vendors~container~main', 'vendors~container'])
constructPageEntry('main', ['vendors~container~main'])

// -------------------- 构建plugins
let plugins = [
    new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: config[MODE].cssName,
        chunkFilename: config[MODE].chunkCssname,
    }),
    ...htmlPlugins
]


module.exports = {
    mode: "production",
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
                        // plugins: ['transform-runtime']
                    }
                }
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.s?css$/,
                exclude: /node_modules/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                }, {
                        loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            plugins: () => [
                                require('autoprefixer')({
                                    browsers: ['> 1%', 'Android >= 2.1', 'ios 7', 'firefox >= 15'],
                                }),
                                px2rem({
                                    remUnit: 75,
                                }),
                            ]
                        }
                    }, {
                        loader: "sass-loader" // 将 Sass 编译成 CSS
                }]
            },
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
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        }
    }
}

