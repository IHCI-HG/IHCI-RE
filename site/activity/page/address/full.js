require('zepto');
var conf = require('../../conf');


/**
 * @require '../../components_modules/reset.css'
 * @require '../../comp/common-css/ql-common.css'
 * @require './full.scss'
 */

var standard = {
    init: function (initData) {
        this.initListeners()
    },

    initListeners: function () {
        $('body').on('click', '.dialog-conform', function () {
            $('.dialog-back').hide();
        });
    },


}

module.exports = standard;