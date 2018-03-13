**简要描述：** 
注册接口
- 

**请求URL：** 
- ` /api/sign-up `
  
**请求方式：**
- POST 

**请求参数：** 

|参数名|类型|说明| 必选 |
|:---- |:----- |-----  |-----|
|username |String   |用户名     |否|
|password |String   |密码     |否|
|name |String   |姓名    |否|
|phone |String   |电话    |否|
|mail |String   |邮件    |否|
|wechat |String   |微信账号    |否|
|QQ |String   |微信号    |否|

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





