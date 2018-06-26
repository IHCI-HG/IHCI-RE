var db = require('./db')
var conf = require('./conf');
const mongoose = require('mongoose')
const TestDB = mongoose.model('test')
const crypto = require('crypto');


conf.init({
    mode: 'dev',
});

db.init();

// setInterval(() => {
//     const randNumber = parseInt(Math.random() * 1000).toString()
//     console.log(randNumber);
//     TestDB.add(randNumber, function(err, doc) {
//         console.log('add', doc);
//     })
// }, 1000)

// TestDB.s_search('228', function(err, doc) {
//     console.log('find', doc);
//     console.log(doc[0].create_time.getTime()) 
// })

TestDB.check('588', '38fc40d19ed30da98d10d9b0eda744101311d8c3').then((e) => {
    console.log(e);
})

