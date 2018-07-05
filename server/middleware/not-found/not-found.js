// 统一 404 的情况下返回的内容
module.exports = function () {
    return function (req, res, next) {
        res.status(404).render('404');
    };
};
