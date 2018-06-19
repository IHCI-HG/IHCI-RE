const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const topicSchema = new mongoose.Schema({
    create_time: { type: String, default : Date.now},
    title: String,
    content: String,
    creator: { type: mongoose.Schema.Types.Mixed , required: true },
    team: String, // team的_id
    discussList: [mongoose.Schema.Types.Mixed],
})

topicSchema.statics = {
    createTopic: async function(title, content, creatorObj, teamId) {
        return this.create({
            title: title, 
            content: content,
            creator: creatorObj,
            team: teamId,
            discussList: [],
        })
    },
    delTopicById: async function(topicId) {
        const result = await this.remove({_id: topicId}).exec()
        return result
    },
    updateTopic: async function(topicId, topicObj) {
        const result = await this.findByIdAndUpdate(topicId, topicObj, () => {})
        return result
    },
    findByTopicId: function(topicId) {
        return this.findById(topicId)
    },
    
    // findByKeyWord: async function(keyWord){                //keyWord
    //     // function unique(arr) {
    //     //     var result = [], hash = {};
    //     //     for (var i = 0, elem; (elem = arr[i].id) != null; i++) {
    //     //     if (!hash[elem]) {
    //     //     result.push(arr[i]);
    //     //     hash[elem] = true;
    //     //     }
    //     //     }
    //     //     return result;
    //     //     }
    //     var query1={};
    //     var query2={};
    //     var query3={};
    //     query1['title']= new RegExp("话题")
    //     query1['content']= new RegExp("话题")
    //     query3['discussList.content']= new RegExp("话题")

    //     const result1 = await this.find(query1).exec()     
    //     const result2 = await this.find(query2).exec()   
    //     const result3 = await this.find(query3).exec()    
    //     const resultAll = result1.concat(result2).concat(result3)
    //     // result = unique(result)
    //     var result = [], hash = {};
    //     for(var m in resultAll){
    //         var elem = resultAll[m].id
    //         if(!hash[elem]){
    //             result.push(resultAll[m])
    //             hash[elem] = true;
    //         }
    //     }
    //     for(var m in result){
    //         console.log("这是话题ID:", result[m].id)
    //     }
    //     return result
    // },
    
    // addDiscuss: async function(topicId, discussObj) {
    //     return this.update(
    //         {_id: topicId},
    //         { $addToSet: { discussList: discussObj}}
    //     ).exec()
    // },
    // delDiscuss: async function(topicId, discussId) {
    //     return this.update(
    //         {_id: topicId},
    //         { $pull: { discussList: {discussId: discussId}}}
    //     ).exec()
    // },
    // updateDiscuss: async function(topicId, discussId, content) {
    //     return this.update(
    //         {_id: topicId, "discussList._id":  mongoose.Types.ObjectId(discussId)},
    //         { $set: { "discussList.$.content": content}}
    //     ).exec()
    // },

}

mongoose.model('topic', topicSchema);