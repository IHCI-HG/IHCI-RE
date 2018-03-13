**简要描述：** 
登录接口
- 

**请求URL：** 
- ` /api/login `
  
**请求方式：**
- POST 

**请求参数：** 

|参数名|必选|类型|说明|
|:----    |:---|:----- |-----   |
|username| 是|String|用户名|
|password|是|String|加密后的密码|

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
|headImgUrl |String   |头像URL地址    |





