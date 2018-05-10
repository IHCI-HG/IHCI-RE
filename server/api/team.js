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

const creatTeam = async (req, res, next) => {
    const teamInfo = req.body.teamInfo || {}
    const userId = req.rSession.userId

    if(!teamInfo.name || !teamInfo.teamImg || !teamInfo.teamDes) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return 
    }

    try {
        let teamObj = await teamDB.createTeam(teamInfo.name, teamInfo.teamImg, teamInfo.teamDes)
        await teamDB.addMember(teamObj._id, userId, 'creator')
        await userDB.addTeam(userId, teamObj._id, 'creator')
        teamObj = await teamDB.findByTeamId(teamObj._id)
         
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '创建成功' },
            data: {
                teamObj: teamObj
            }
        });
    } catch (error) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
        console.error(error);
    }
}

const joinTeam = async (req, res, next) => {
    const teamId = req.body.teamId
    const userId = req.rSession.userId

    if(!teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }

        // 检验是否已经加入该团队
        let isJoined = false
        teamObj.memberList.map((item) => {
            if(item.userId === userId) {
                isJoined = true
            }
        })
        if(isJoined) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '您已在团队中' },
                data: {}
            });
            return
        }

        await teamDB.addMember(teamId, userId, 'member')
        await userDB.addTeam(userId, teamId, 'member')
        teamObj = await teamDB.findByTeamId(teamId)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '加入成功' },
            data: {
                teamObj: teamObj
            }
        });

    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

const modifyMemberRole = async (req, res, next) => {
    const body = req.body
    const userId = req.rSession.userId
    const teamId = body.teamId 

    if(!body.teamId || !body.userId || !body.role) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj || !teamObj.memberList) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }

        let myRole = null
        teamObj.memberList.map((item) => {
            if(item.userId == userId) {
                myRole = item.role
            }
        })

        if(!myRole) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '你不并在这个团队里面'},
                data: {}
            });
            return
        }

        if(myRole == "member") {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '成员没有管理权限'},
                data: {}
            });
            return
        }

        if(role == "creator") {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '不能设置创建者'},
                data: {}
            });
            return
        }

        await teamDB.changeMemberRole(teamId, userId, body.role)
        await userDB.modifyTeamRole(userId, teamId, body.role)
        teamObj = await teamDB.findByTeamId(teamId)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '修改成功' },
            data: {
                teamObj: teamObj
            }
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

const modifyTeamInfo = async (req, res, next) => {
    const teamId = req.body.teamId
    const teamInfo = req.body.teamInfo
    const userId = req.rSession.userId 

    /* teamInfo

        name: name, 
        teamImg: imgUrl,
        teamDes: des,
    */

    if(!teamInfo || !teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }

        const result = await teamDB.updateTeam(teamId, teamInfo)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '设置成功' },
            data: {
                teamObj: result
            }
        });

    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }

}

const markTeam = async (req, res, next) => {
    const teamId = req.body.teamId
    const markState = req.body.markState
    const userId = req.rSession.userId 

    if(!teamId || !markState) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }
        let userObj = await userDB.findByUserId(userId)
        if(!userObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '用户不存在'},
                data: {}
            });
            return
        }

        let isInTeam = false
        userObj.teamList.map((item) => {
            if(item.teamId === teamId) {
                isInTeam = true
            }
        })
        if(!isInTeam) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '你不在该团队中'},
                data: {}
            });
            return
        }

        const result = await teamDB.markTeam(userId, teamId, markState)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '设置成功' },
            data: result
        });


    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }

}

const kikMember = async (req, res, next) => {
    const teamId = req.body.teamId
    const tarMemberId = req.body.memberId
    const userId = req.rSession.userId 


    if(!tarMemberId || !teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }

    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }

        let power = false
        teamObj.memberList.map((item) => {
            if(item.userId == userId && (item.role == 'creator' || item.role == 'admin')) {
                power = true
            }
        })
        if(!power) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '没有权限'},
                data: {}
            });
            return
        }


        const result = await teamDB.delMember(teamId, tarMemberId)
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '设置成功' },
            data: {
                result: result
            }
        });

    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}

const teamInfo = async (req, res, next) => {
    const teamId = req.body.teamId
    if(!teamId) {
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: "参数不全" },
            data: {}
        });
        return
    }
    try {
        let teamObj = await teamDB.findByTeamId(teamId)
        if(!teamObj) {
            resProcessor.jsonp(req, res, {
                state: { code: 1, msg: '团队不存在'},
                data: {}
            });
            return
        }
        resProcessor.jsonp(req, res, {
            state: { code: 0, msg: '请求成功' },
            data: teamObj
        });
    } catch (error) {
        console.error(error);
        resProcessor.jsonp(req, res, {
            state: { code: 1, msg: '操作失败' },
            data: {}
        });
    }
}




module.exports = [
    ['GET', '/api/test', test],
    ['POST', '/api/team/info', apiAuth, teamInfo],
    ['POST', '/api/team/create', apiAuth, creatTeam],
    ['POST', '/api/team/modifyTeamInfo', apiAuth, modifyTeamInfo],
    ['POST', '/api/team/join', apiAuth, joinTeam],
    ['POST', '/api/team/roleModify', apiAuth, modifyMemberRole],
    ['POST', '/api/team/markTeam', apiAuth, markTeam],
    ['POST', '/api/team/kikMember', apiAuth, kikMember],
];
