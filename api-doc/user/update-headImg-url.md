**简要描述：** 
注册接口
- 

**请求URL：** 
- ` /api/update-head-img `
  
**请求方式：**
- POST 

**前置条件**
- 需要先登录才能用这个接口，否则直接返回失败

**请求参数：** 

|参数名|类型|说明| 必选 |
|:---- |:----- |-----  |-----|
|headImgUrl |String   |用户头像     |是|


**返回参数：** 

|参数名|类型|说明|
|:----    |:---|:----- |-----   |
|data | object   |   userPo    |


**返回userPo对象Object说明：** 

|参数名|类型|说明|
|:---- |:----- |-----  |
|_id   |String   |用户唯一标识       |
|userName |String   |用户名     |
|name |String   |姓名    |
|phone |String   |电话    |
|mail |String   |邮件    |
|wechat |String   |微信账号    |
|QQ |String   |微信号    |
|headImgUrl |String   |用户头像     |





