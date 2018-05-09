var mongoose = require('mongoose')

var teamDB = mongoose.model('team')
var userDB = mongoose.model('user')



module.exports.apiProxy = apiProxy;