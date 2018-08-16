const WxChoose = {
    PERSON_INFO_CHECK: {
        ENTER_USERNAME_EMPTY: "账号为空",
        ENTER_PASSWORD_EMPTY: "密码为空"
    },
    RESPONSE_MESSAGE:{
        WELCOME_BACK_MSG:"欢迎回到iHCI平台",
        SUBMIT_ERROR_MSG:"请重新输入",
        COMPLETE_PERSON_INFO:"请完善个人信息"
    },
    PAGE_INFO: {
        CHOOSE_BLOCK_TITLE:"欢迎来到iHCI平台",
        PAGE_IHCI_DESC:"iHCI平台介绍",
        ACCOUNT_BLOCK_TITLE:"绑定已有账号",
    },
    LABEL_TEXT:{
        USERNAME_LABEL_TEXT:"账号: ",
        PASSWORD_LABEL_TEXT:"密码: ",
    },
    BUTTON_TEXT:{
        BIND_ACCOUNT_BUTTON:"绑定账号",
        ENTER_IHCI_BUTTON:"直接进入平台",
        SUBMIT_BUTTON:"确定",
        CANCEL_BUTTON:"取消"
    },
}
const IhciJoin = {
    PERSON_INFO_CHECK : {
        CREATE_NAME_EMPTY: "姓名为空",
        CREATE_PHONE_EMPTY: "手机号为空",
        CREATE_EMAIL_EMPTY: "邮箱为空",
        CREATE_NAME_ILLEGAL: "名字以不超过12个的英文、汉字、数字、下划线与短横构成，并以中文或英文开头",
        CREATE_PHONE_ILLEGAL: "格式错误,请填写正确格式的邮件地址",
        CREATE_EMAIL_ILLEGAL: "格式错误,请填写正确格式的电话号码",
    },
    RESPONSE_MESSAGE :{
        WELCOME_IHCI_MSG: "欢迎来到iHCI平台",
        SUBMIT_ERROR_MSG: "操作失败，请稍后重试",
    },
    PAGE_INFO: {
        PAGE_TITLE:"关于iHCI",
        PAGE_IHCI_DESC:"iHCI的详情",
        JOIN_BLOCK_TITLE: "加入iHCI",
    },
    LABEL_TEXT: {
        NAME_LABEL_TEXT: "姓名: ",
        EMAIL_LABEL_TEXT: "邮箱: ",
        PHONE_LABEL_TEXT: "手机: ",
    },
    BUTTON_TEXT: {
        ENTER_IHCI_BUTTON: "加入",
    }

}
module.exports.WxChoose = WxChoose
module.exports.IhciJoin = IhciJoin
