const loginRoute = require('./login');

module.exports = [
    // 微信微博登录页（暂用微博的登录页，后续不变化可以抽成公用页）
    ['GET', '/page/login', loginRoute.pageLogin],

    // 活动页登录页面
    ['GET', '/wechat/page/activity/login', loginRoute.pageActLogin],

    // 退出登录
    // 因为 API 不会被 Java 拦截
    ['GET', '/api/logout', loginRoute.pageLogout],
];
