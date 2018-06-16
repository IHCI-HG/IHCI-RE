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
        var resp = fn && fn()
        console.log(key,'params:',params)
        console.log('resp:', resp)
        return resp
    }
}


http.listen('/team/:id/todolist', function () {
    const todoList = [
        {
            id: 1,
            name: '了解tower',
            hasDone: true,
            ddl: '2018.7.7',
            assignee: {
                id: 1,
                username: '黄',
            },
            checkItem: [{
                id: 1,
                hasDone: true,
                name: '子检查项'
            }, {
                id: 2,
                hasDone: false,
                name: '子检查项2'
            }, {
                id: 3,
                hasDone: false,
                name: '子检查项3'
            }]
        }, {
            id: 2,
            name: '了解tower',
            hasDone: true,
            assignee: null,
            checkItem: [],
        }, {
            id: 3,
            name: '了解tower',
            hasDone: false,
            assignee: null,
            checkItem: null,
        },
    ]
    return Mock.mock(todoList)
})


export default http
