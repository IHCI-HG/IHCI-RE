var _ = require('underscore'),
    resProcessor = require('../components/res-processor/res-processor'),
    proxy = require('../components/proxy/proxy'),
    conf = require('../conf');

    
import fetch from 'isomorphic-fetch';
import lo from 'lodash';
import apiAuth from '../middleware/auth/api-auth'

import { 
    web_codeToAccessToken, 
    web_accessTokenToUserInfo,
    web_codeToUserInfo,
} from '../components/wx-utils/wx-utils'

var mongoose = require('mongoose')

var teamDB = mongoose.model('team')
var userDB = mongoose.model('user')

const test = async (req, res, next) => {
    const teamObj = await teamDB.createTeam('name', 'url', 'test')
    await teamDB.addMember(teamObj._id, 'userId', 'creator')
    await teamDB.addMember(teamObj._id, 'userId1', 'member')
    await teamDB.addMember(teamObj._id, 'userId2', 'member')
    const result = await teamDB.changeMemberRole(teamObj._id, 'userId2', 'admin')
    await teamDB.addTopic(teamObj._id, 'topicId11')
     
    resProcessor.jsonp(req, res, {
        state: { code: 0 },
        data: {
            sysTime: new Date().getTime(),
            result: result
        }
    });
}


module.exports = [
    ['GET', '/api/test',apiAuth, test],
   
];
