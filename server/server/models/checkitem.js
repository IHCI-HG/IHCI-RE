// const mongoose = require('mongoose')
// const crypto = require('crypto');
// const conf = require('../conf')

// const checkitemSchema = new mongoose.Schema({
    // create_time: { type: String, default: Date.now },
    // title: String,
    // content: String,
    // creator: { type: mongoose.Schema.Types.Mixed, required: true },
    // fileList: [mongoose.Schema.Types.Mixed],
    // teamId: String,
    // taskId: String,
    // header: String,
    // deadline: String,
    // completed_time: String,
    // state: Boolean,
// })

// checkitemSchema.statics = {
//     createCheckitem: async function (teamId, taskId, title, content, creatorObj, fileList, header, deadline) {
//         return this.create({
//             teamId: teamId,
//             taskId: topicId,
//             title: title,
//             content: content,
//             creator: creatorObj,
//             fileList: fileList || [],
//             header: header,
//             deadline: deadline,
//             state: false
//         })
//     },

//     updateCheckitem: async function (checkitemId, checkitemObj) {
//         const result = await this.findByIdAndUpdate(checkitemId, checkitemObj, () => { })
//         return result
//     },

//     delCheckitemById: async function (checkitemId) {
//         const result = await this.remove({ _id: checkitemId }).exec()
//         return result
//     }


// }

// mongoose.model('checkitem', checkitemSchema);