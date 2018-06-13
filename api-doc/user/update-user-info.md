**简要描述：** 

- 修改用户信息
- 传什么字段就改变什么字段
- 没有传的部分保持原样
- 别多传字段搞事情


**请求URL：** 
- ` /api/update-user-info `
  
**请求方式：**
- POST 

**前置条件**
- 需要先登录才能用这个接口，否则直接返回失败

**请求参数：** 

|参数名|类型|说明| 必选 |
|:---- |:----- |-----  |-----|
|name |String   |姓名    | 否
|phone |String   |电话    | 否
|mail |String   |邮件    | 否
|wechat |String   |微信账号    | 否
|QQ |String   |微信号    | 否
|headImgUrl |String   |用户头像 | 否


**返回参数：** 

|参数名|类型|说明|
|:----    |:---|:----- |-----   |
|data | object   |   userPo    |

**返回userPo对象Object说明：** 

|参数名|类型|说明|
|:---- |:----- |-----  |
|_id   |String   |用户唯一标识       |
|username |String   |用户名     |
|name |String   |姓名    |
|phone |String   |电话    |
|mail |String   |邮件    |
|wechat |String   |微信账号    |
|QQ |String   |微信号    |
|headImgUrl |String   |用户头像     |





