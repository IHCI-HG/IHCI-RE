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
        SET_USERNAME:"账号: ",
        SET_PASSWORD:"密码: ",
    },
    BUTTON_TEXT:{
        BIND_ACCOUNT:"绑定账号",
        ENTER_IHCI:"直接进入平台",
        SUBMIT:"确定",
        CANCEL:"取消"
    },
}
const IhciJoin = {
    PERSON_INFO_CHECK : {
        CREATE_NAME_EMPTY: "姓名为空",
        CREATE_PHONE_EMPTY: "手机号为空",
        CREATE_EMAIL_EMPTY: "邮箱为空",
        CREATE_NAME_ILLEGAL: "名字以不超过12个的英文、汉字、数字、下划线与短横构成，并以中文或英文开头",
        CREATE_EMAIL_ILLEGAL: "格式错误,请填写正确格式的邮件地址",
        CREATE_PHONE_ILLEGAL: "格式错误,请填写正确格式的电话号码",
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
        SET_NAME: "姓名: ",
        SET_EMAIL: "邮箱: ",
        SET_PHONE: "手机: ",
    },
    BUTTON_TEXT: {
        ENTER_IHCI: "加入",
    }

}
const Person = {
    PERSON_INFO_CHECK: {
        PERSON_INFO_ILLEGAL:"设置失败，请检查格式",
        IMAGE_ILLEGAL: "文件格式必须是JPG，JPEG或PNG",
        CREATE_NAME_ILLEGAL: "加入iHCI要求实名",      

    },
    RESPONSE_MESSAGE: {
        SET__SUCCESS: "设置成功",
        SET_FAIL: "设置失败，请稍后再试",
        FIRST_SET_INFO_SUCCESS: "设置成功，已发送使用说明邮件，请检查邮箱",
        BIND_WX_FAIL: "解绑失败",
        UPLOAD_IMAGE_FAIL: "上传图片失败",
        UPLOAD_IMAGE_SUCCESS: "上传图片成功",
        ACTIVATE_MAIL_WAIT: "请不要重复提交激活请求，请等待60s后再尝试发送",
        ASKTO_SET_MAIL: "邮箱未设置，请先修改邮箱",
        ACTIVATE_MAIL_SUCCESS: "已发送激活邮件，请检查邮箱",
        ACTIVATE_MAIL_FAIL: "激活邮件发送失败，请稍后再试",
        SET_ACCOUNT_SUCCESS: "设置成功",
    },
    PAGE_INFO: {
        PAGE_TITLE: "个人设置",
    },
    LABEL_TEXT: {
        SET_ACCOUNT: "尚未设置账号密码，请",
        SET_USENAME: "账号：",
        SET_PASSWORD: "密码：",
        WX_BLOCK_TITLE: "微信",
        WX_BOUND: "已绑定",
        WX_NOT_BOUND: "未绑定",
        WX_UNBIND: "解绑",
        FOLLOW_BLOCK_TITLE: "服务号",
        NOT_FOLLOW: "未关注",
        FOLLOWED: "已关注",
        FOLLOW_NOTICE_A: "需要",
        FOLLOW_NOTICE_B: "才能接受讨论消息提醒",
        SET_NAME: "姓名",
        EMAIL_BLOCK_TITLE: "邮箱",
        SET_EMAIL: "修改邮箱",   
    },
    BUTTON_TEXT: {
        TEAM_EXIT: "退出团队",
        UPLOAD_IMAGE: "上传图片",
        SET_ACCOUNT: "设置账号密码",
        SUBMIT: "确定",
        FOLLOW: "关注服务号",



    }
}
module.exports.WxChoose = WxChoose
module.exports.IhciJoin = IhciJoin
