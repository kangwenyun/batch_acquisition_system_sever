exports.login =
    {
        type: "object",
        properties: {
            userid: { type: "string", required: true },
            passwd: { type: "string", required: true },
        }
    }
exports.regist =
    {
        type: "object",
        properties: {
            userid: { type: "string", required: true },
            passwd: { type: "string", required: true },
            username: { type: "string", required: true },
            sex: { type: "string", required: true },
            job: { type: "string", required: true },
        }
    }
exports.getuserinfo =
    {
        type: "object",
        properties: {
            userid: { type: "string", required: true }
        }
    }
exports.changeuserinformation =
    {
        type: "object",
        properties: {
            userid: { type: "string", required: true },
            username: { type: "string", required: true },
            birthday: { type: "string", required: true },
            habit: { type: "string", required: true },
            email: { type: "string", required: true },
            weixin: { type: "string", required: true },
            qq: { type: "string", required: true },
            phone: { type: "string", required: true },
            joinday: { type: "string", required: true },
           // area: { type: "string", required: true },
            sex: { type: "string", required: true },
            job: { type: "string", required: true },
            phone: { type: "string", required: true },
        }
    }

    exports.getpersonlist =
    {
        type: "object",
        properties: {
            userid: { type: "string", required: true }
        }
    }