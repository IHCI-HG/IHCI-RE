var mongoose = require('mongoose');
var conf = require('./conf');
var fs = require('fs');
const join = require('path').join;

const models = join(__dirname, './models');

fs.readdirSync(models)
  .filter(file => ~file.search(/^[^\.].*\.js$/))
  .forEach(file => require(join(models, file)));

function connect () {
  var options = {
      server: {
          socketOptions: {
              keepAlive: 1
          }
      }
  };
  mongoose.connect(conf.db).connection
  return mongoose.connection;
}


module.exports.init = () => {

    connect()
        .on('error', console.log)
        .on('disconnected', connect)
        .once('open', (e) => {
            console.log('mongodb is connected');
        });
};
