const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const timelineSchema = new mongoose.Schema({
    create_time: { type: Date, default : Date.now},
    teamId: {type: String, required: true , index: true},
    creator: mongoose.Schema.Types.Mixed,
    tType: String,
    title: String,
    content: String,
    tarId: String,
})

timelineSchema.statics = {
    

}

mongoose.model('timeline', timelineSchema);