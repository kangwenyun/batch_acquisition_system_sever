var  nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service:'qq',
    auth: {
        user: '2063731150@qq.com',
        pass: 'kfgfxjmfzrsucecj'
    }
});
var  mailOptions = {
    from: '2063731150@qq.com', // sender address
    to: '1157211454@qq.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
});