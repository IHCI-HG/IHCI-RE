var Mock = require('mockjs');

// 极简mock
var http = {
    urlList: {},
    listen(key, func) {
        this.urlList[key] = func
    },
    httpMock() {
        // 肉眼检查,打印参数
        var key = Array.prototype.shift.call(arguments)
        var params = Array.prototype.shift.call(arguments)
        var fn = this.urlList[key]
        var resp = fn && fn(params)
        console.log(key,'params:',params)
        console.log('resp:', resp)
        return resp
    }
}

// common
http.listen('/common/delete', function (params) {
    const data = {
        status: 200,
        data: {
        }
    }
    return Mock.mock(data)
})

http.listen('/common/post', function (params) {
    const data = {
        status: 201,
        data: {
        }
    }
    return Mock.mock(data)
})


http.listen('/team/:id/todolist/get', function (params) {
    const data = {
        'status': 200,
        data: {
            'todoList|2': [{
                'id|+1': '@natural(1000,1100)',
                name: '@cparagraph(1)',
                'list|7-10': [{
                    'id|+1': '@natural(0,100)',
                    name: '@cparagraph(1)',
                    hasDone: '@boolean',
                    completeTime: '6 20, 2018 10:03:15',
                    'ddl|0-1': '@date',
                    'assignee|0-1': {
                        id: '@natural(0,100)',
                        username: '@cname',
                    },
                    checkItemDoneNum: "@natural(0,3)",
                    checkItemNum: "@natural(3,5)",
                }]
            }]
        }
    }
    return Mock.mock(data)
})


http.listen('/todolist/post', function (params) {
    const data = {
        'status': 201,
        data: {
            todoList: {
                id: '@natural(100,200)',
                name: params.name || '',
            }
        }
    }
    return Mock.mock(data)
})


http.listen('/todolist/put', function (params) {
    const data = {
        'status': 200,
        data: {
            todoList: {
                id: params.id,
                name: params.name || '',
            }
        }
    }
    return Mock.mock(data)
})



// todo
http.listen('/todo/:id/get', function (params) {
    const data = {
        'status': 200,
        data: {
            'todo': {
                'teamId': '5b1f440ea7975b4dc11788f5',
                'id': '@natural(1000,1100)',
                hasDone: '@boolean',
                desc: '@cparagraph(2)',
                name: '@cparagraph(1)',
                'list|7-10': [{
                    'id|+1': '@natural(0,100)',
                    name: '@cparagraph(1)',
                    hasDone: '@boolean',
                    completeTime: '6 20, 2018 10:03:15',
                    'ddl|0-1': '@date',
                    'assignee|0-1': {
                        id: '@natural(0,100)',
                        username: '@cname',
                    },
                }]
            },
            'topicList|5':[{
                'id|+1': '@natural(1000,1100)',
                creator: {
                    'id|+1': '@natural(1000,1100)',
                    name: '@cparagraph(1)',
                    headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                    phone: '@natural(0000000000000,9999999999999)',
                    mail: 'ada@qq.com',
                }, 
                title: '@cparagraph(1)',
                content: '@cparagraph(1)',
                time: '@datetime("yy-MM-dd a HH:mm:ss")',
            }]
        }
    }
    return Mock.mock(data)
})

http.listen('/todo/post', function (params) {
    const data = {
        'status': 201,
        data: {
            sourceId:'@natural(100,200)',
            todo: {
                listId: params.listId || null,
                id: '@natural(100,200)',
                name: params.name || '',
                desc: params.desc || '',
                assignee: {
                    id: params.assigneeId || 'null',
                    name: '返回name',
                },
                ddl: params.ddl || null,
                checkItemDoneNum: 0,
                checkItemNum: 0,
                hasDone: false,
            },
        }
    }
    return Mock.mock(data)
})

http.listen('/todo/:id/post', function (params) {
    const data = {
        'status': 201,
        data: {
            topic:{
                id: params.teamId || null,
                creator: {
                    id: '@natural(1000,1100)',
                    name: '@cparagraph(1)',
                    headImg: 'https://img.qlchat.com/qlLive/userHeadImg/9IR4O7M9-ZY58-7UH8-1502271900709-F8RSGA8V42XY.jpg@132h_132w_1e_1c_2o',
                    phone: '@natural(0000000000000,9999999999999)',
                    mail: 'ada@qq.com',
                }, 
                title: params.title || '',
                content:  params.content || '',
                time: params.time || '',
            },
        }
    }
    return Mock.mock(data)
})

http.listen('/todo/:id/put', function (params) {
    const data = {
        'status': 200,
        data: {
            todo: {
                teamId:params.teamId || '返回teamId',
                id: params.id || '返回id',
                name: params.name || '返回name',
                desc: params.desc || 'desc',
                assignee: {
                    id: params.assigneeId || '返回assigneeId',
                    name: '返回name',
                },
                ddl: params.ddl || '返回时间',
                hasDone: params.hasDone !== null?params.hasDone : '不变',
                completeTime: '6 20, 2018 10:03:15',
            }
        }
    }
    return Mock.mock(data)
})


http.listen('/check_item/post', function (params) {
    const data = {
        status: 201,
        data: {
            checkItem: {
                todoId: params.todoId || null,
                id: '@natural(100,200)',
                name: params.name || '',
                assignee: {
                    id: params.assigneeId || 'null',
                    name: '返回name',
                },
                ddl: params.ddl || null,
                hasDone: false,
            }
        }
    }
    return Mock.mock(data)
})


http.listen('/check_item/:id/put', function (params) {
    const data = {
        status: 200,
        data: {
            checkItem: {
                todoId: params.todoId || null,
                id: params.id || '返回id',
                name: params.name || '返回name',
                assignee: {
                    id: params.assigneeId || '返回assigneeId',
                    name: '返回name',
                },
                ddl: params.ddl || '返回时间',
                hasDone: params.hasDone !== null?params.hasDone : '不变',
                completeTime: '6 20, 2018 10:03:15',
            }
        }
    }
    return Mock.mock(data)
})


export default http
