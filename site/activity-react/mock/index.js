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
http.listen('/todo/post', function (params) {
    const data = {
        'status': 201,
        data: {
            todo: {
                listId: params.listId || null,
                id: '@natural(100,200)',
                name: params.name || '',
                desc: params.desc || '',
                // assignee: null,
                assignee: {
                    id: params.assigneeId || 'null',
                    name: '返回name',
                },
                ddl: params.ddl || null,
                checkItemDoneNum: 0,
                checkItemNum: 0,
                hasDone: false,
            }
        }
    }
    return Mock.mock(data)
})


http.listen('/todo/:id/put', function (params) {

    const data = {
        'status': 200,
        data: {
            todo: {
                id: params.id || '返回id',
                name: params.name || '返回name',
                desc: params.desc || 'desc',
                assignee: {
                    id: params.assigneeId || '返回assigneeId',
                    name: '返回name',
                },
                ddl: params.ddl || '返回name',
                hasDone: params.hasDone !== null?params.hasDone : '不变',
            }
        }
    }
    return Mock.mock(data)
})


export default http
