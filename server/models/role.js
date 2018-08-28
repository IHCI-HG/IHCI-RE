const mongoose = require('mongoose')
const crypto = require('crypto');
const conf = require('../conf')

const roleSchema = new mongoose.Schema({
    userId:String,
    teamId:String,
    role:String,
})


roleSchema.statics = {
    createRole: function(teamId, userId, role) {
        return this.create({
            teamId: teamId,
            userId: userId,
            role: role
        })
    },

    findRole: async function(userId,teamId) {
        return this.findOne({
            teamId: teamId,
            userId: userId
        }).exec()
    },

    updateRole: async function(roleId, roleObj) {
        const result = await this.findByIdAndUpdate(roleId, roleObj,{ new: true }, () => {})
        return result
    },

    delRoleById: async function (roleId) {
        const result = await this.remove({ _id: roleId }).exec()
        return result
    },
}

mongoose.model('role', roleSchema);