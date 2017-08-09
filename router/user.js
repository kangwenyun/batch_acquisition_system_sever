var dbops = require("../dbops");
var fs = require("fs");
var path = require("path");
var multer = require("multer");
//
var ss = require('silly-datetime');
var log4js = require('log4js')
log4js.configure('./config/log4js.json');
var logger = log4js.getLogger("http");
//
var validate = require('express-jsonschema').validate;
var schema = require('../schema/user.js');
//
var myDate = new Date();
var date = myDate.toLocaleDateString();
var upload = multer({ dest: 'public/image/' + date });
//邮箱初始化
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'qq',
  auth: {
    user: '2063731150@qq.com',
    pass: 'kfgfxjmfzrsucecj'
  }
});
//-----------------------------------------------


module.exports = function (router) {
  function mailTo(email) {
    var mailOptions = {
      from: '2063731150@qq.com', // sender address
      to: email, // list of receivers
      subject: 'Sorry ✔', // Subject line
      text: '对不起，您未在批次采集系统中注册成功..', // plain text body
      html: '<b>对不起，您未在批次采集系统中注册成功..</b>' // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    });
  }
  function forgetmailTo(email, passwd) {
    var mailOptions = {
      from: '2063731150@qq.com', // sender address
      to: email, // list of receivers
      subject: 'passwd ✔', // Subject line
      text: '您的密码是：' + passwd, // plain text body
      html: '<b>您的密码是：' + passwd + '</b>' // html body
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
    });
  }

  function userlog(session, dowhat) {
    console.log("|" + session + "|" + dowhat);
    logger.info("|" + session + "|" + dowhat);
  }
  function authUser(req, res, next) {
    // if (req.session.user == req.body.userid) {
    //   next();
    // }
    // else {
    //   res.json({ err: 0, success: false, msg: "无效的用户" })
    // }
    next();
  }
  function authSchema(err, req, res, next) {

    var responseData;

    if (err.name === 'JsonSchemaValidation') {
      // Log the error however you please 
      console.log(err.message);
      // logs "express-jsonschema: Invalid data found" 

      // Set a bad request http response status or whatever you want 
      res.status(400);

      // Format the response body however you want 
      responseData = {
        success: false,
        statusText: 'Bad Request',
        jsonSchemaValidation: true,
        validations: err.validations  // All of your validation information 
      };

      // Take into account the content type if your app serves various content types 
      if (req.xhr || req.get('Content-Type') === 'application/json') {
        res.json(responseData);
      } else {
        // If this is an html request then you should probably have 
        // some type of Bad Request html template to respond with 
        //res.render('badrequestTemplate', responseData);
        res.json(responseData);
      }
    } else {
      // pass error to next error middleware handler 
      next(err);
    }
  }

  function checkpermisson(req, res, next) {
    dbops.findOne("Users", { userid: req.body.userid }, function (err, doc) {
      if (err) {
        res.json({ err: 1, success: false, msg: "system error" });
      }
      else {
        if (doc && doc.level == 0) {
          next();
        }
        else {
          console.log(req.body.userid);
          res.json({ error: 0, success: false, msg: "权限不够" });
        }
      }
    });
  }

  function setTOInitialPasswd(req, res, next) {
    if (req.body.userid) {
      dbops.findOne('Users', { 'userid': req.body.userid }, (err, doc) => {
        //判断是否可以找到用户数据且用户请求的是自身的数据
        dbops.updateOne('Users', { 'userid': req.body.userid }, { 'passwd': "7cegik" }, function (err, doc) {
            if (err) {
              message = "更改密码失败";
              // res.json({ err: 0, success: false, msg: "更改密码失败" });

            }
            else {
              message = "更改密码成功";
              console.log(message)
              next();
            }
        });
      })
    }else {
      message = "更改密码失败";
      res.json({ err: 1, success: false, msg: "更改密码失败" });
    }
  }

  router.get('/user/helloworld', function (req, res) {
   res.json({err:0});
  });
  router.post('/helloworld', function (req, res) {
    res.json({ error: 0 });
    console.log(req.body.hello);
  });
  //+一个默认头像
  router.post("/user/regist", validate({ body: schema.regist }), authSchema, function (req, res) {
    //  req= {
    //    "userid":"admin1",
    //       "passwd":"admin",
    //       "username":"admin",
    //       "birthday":"1991",
    //       "sex":"0",
    //       "job":"123",
    //       "level":"0",
    //       "photo":"",
    //****   "joinday":"", //"habit":"" //"email":""  //"weixin":"" //"area":"" //phone:""//"qq":
    //       "level":"0"
    //    }
    var photo1;
    if (req.body.photo == null) {
      photo1 = "/admin.jpg";
    }
    else {
      photo1 = req.body.photo;
    }
    insertItem = {
      userid: req.body.userid,
      passwd: req.body.passwd,
      username: req.body.username,
      birthday: req.body.birthday,
      sex: req.body.sex,
      habit: req.body.habit,
      email: req.body.email,
      weixin: req.body.weixin,
      qq: req.body.qq,
      phone: req.body.phone,
      joinday: req.body.joinday,
      area: req.body.area,
      photo: photo1,
      job: req.body.job,
      level: -1
    }
    dbops.findOne("Users", { userid: req.body.userid }, function (err, result) {
      if (err) {
        res.json({ err: 1, success: false, msg: "system error" });
      } else {
        if (result) //先查看Users中是否有这个用户  如果有
        {
          console.log("注册失败,用户已经存在");
          message = "注册失败,用户的已经存在";
          res.json({ err: 1, success: false, msg: message });
        }
        else {
          //再查看checkUsers中是否有这个用户  如果有 就失败
          dbops.existOrInsert("checkUsers", { userid: req.body.userid }, insertItem, function (err, result) {
            if (err) {  //先查看Users中是否有这个用户  如果有
              console.log("注册失败,用户已经存在");
              message = "注册失败,用户的已经存在";
              res.json({ err: 1, success: false, msg: "注册失败,用户的已经存在" });
            }
            else {  //如果没有 就添加到checkUsers里面
              message = "请等待审核"
              res.json({ err: 0, success: true, msg: "请等待审核" });
            }
          });
        }
      }
    });
  });
  router.post("/user/checkpermission", function (req, res) {
    dbops.findOne("Users", { userid: req.body.userid }, function (err, doc) {
      if (err) {
        res.json({ err: 1, success: false, msg: "system error" });
      }
      else {
        console.log(doc.level)
        if (doc && doc.level == 0) {
          res.json({ error: 0, success: true, msg: "权限足够" });
        }
        else {
          res.json({ error: 0, success: false, msg: "权限不够" });
        }
      }
    });
  })
  router.post("/user/checkuserlist", authUser, checkpermisson, function (req, res) {
    //先查看权限
    //req={userid:*****}
    var list = [];
    dbops.findMany("checkUsers", {}, function (err, result) {
      if (err) {
        res.json({ error: 1, success: false, msg: "system error" });
      }
      else {

        for (var i = 0; i < result.length; i++) {
          var item = {
            userid: result[i].userid,
            username: result[i].username,
            //
            birthday: result[i].birthday,
            sex: result[i].sex,
            habit: result[i].habit,
            email: result[i].email,
            weixin: result[i].weixin,
            qq: result[i].qq,
            phone: result[i].phone,
            joinday: result[i].joinday,
            area: result[i].area,
            job: result[i].job,
            level: result[i].level
          }
          list.push(item);
        }
        userlog(req.session.user, "获得待审核注册人的列表成功");
        res.json({ error: 0, msg: "获得待审核注册人的列表成功", success: true, personlist: list });
      }
    });
  });

  router.post("/user/checkuser", authUser, checkpermisson, function (req, res) {
    //传入 该要修改用户的 req={ userid:****,changeuserid:****,level:***}
    dbops.updateOne("checkUsers", { userid: req.body.changeuserid }, { level: req.body.level }, function (err, result) {
      if (err) {
        res.json({ error: 1, success: false, msg: "system error" });
      }
      else {
        res.json({ error: 0, success: true, msg: "修改" + req.body.changeuserid + "的权限成功" });
      }
    })
  });

  function cantouser(req, res, next) {
    dbops.findOne("checkUsers", { userid: req.body.changeuserid }, function (err, ress) {
      if (err) {
        res.json({ error: 1, success: false, msg: "system error" });
      }
      else {
        if (ress) {
          if (ress.level == -1) {
            res.json({ err: 0, success: false, msg: "请给该用户添加权限以后再审核" });
          }
          else {
            next();
          }
        }
        else {
          res.json({ err: 0, success: false, msg: "没有该用户" });
        }
      }
    });
  }
  router.post("/user/checkusertouser", authUser, checkpermisson, cantouser, function (req, res) {
    //审核通过 从checkUsers to Users
    //req={userid:*** changeuserid:***}
    dbops.findOne("checkUsers", { userid: req.body.changeuserid }, function (err, result) {
      if (err) {
        res.json({ error: 1, success: false, msg: "system error" });
      }
      else {
        var leavetime1 = ss.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
        if (result) {
          insertItem = {
            userid: result.userid,
            passwd: result.passwd,
            username: result.username,
            birthday: result.birthday,
            sex: result.sex,
            habit: result.habit,
            email: result.email,
            weixin: result.weixin,
            qq: result.qq,
            phone: result.phone,
            joinday: result.joinday,
            area: result.area,
            photo: result.photo,
            job: result.job,
            level: result.level,
            leavetime: leavetime1
          }
          dbops.insertOne("Users", insertItem, function (err, result) {
            if (err) {
              res.json({ err: 1, success: false, msg: "system error" });
            }
            else {
              dbops.deleteOne("checkUsers", { userid: req.body.changeuserid }, function (err, result) {
                if (err) {
                  res.json({ err: 1, success: false, msg: "system error" });
                }
                else {
                  userlog(req.body.changeuserid, "注册成功");
                  res.json({ err: 0, success: true, msg: "恭喜，注册成功" });
                }
              });

            }
          });
        }
        else {
          //null
          res.json({ error: 0, success: false, msg: "出现不可预知的错误" });
        }
      }
    })
  });



  router.post("/user/refusecheck", authUser, checkpermisson, function (req, res) {
   console.log("-------------------------------------")
    console.log(req.body.changeuserid+"  "+req.body.email);
   // mailTo(req.body.email);  
    dbops.deleteOne("checkUsers", { userid: req.body.changeuserid }, function (err, result) {
      if (err) {
        res.json({ err: 1, success: false, msg: "system error" });
      }
      else {
        //发送邮件
        res.json({ err: 0, success: true, msg: "删除成功并且发送邮箱通知" });
      }
    });
  });
  router.post("/user/getuserinfo", authUser, validate({ body: schema.getuserinfo }), authSchema, function (req, res) {
    //获得用户的个人信息
    //req={userid:"admin"}
    // req.session.user=req.body.userid;
    console.log(req.session.user);
    dbops.findOne("Users", { userid: req.body.userid }, function (err, result) {
      if (err) {
        res.json({ err: 1, success: false, msg: "system error" });
      }
      else {
        if (result) {
          res.json({
            err: 0,
            success: true,
            msg: "获得个人信息成功",
            userid: result.userid,
            username: result.username,
            birthday: result.birthday,
            habit: result.habit,
            email: result.email,
            weixin: result.weixin,
            qq: result.qq,
            phone: result.phone,
            joinday: result.joinday,
            area: result.area,
            sex: result.sex,
            job: result.job,
            photo: result.photo,
            level: result.level
          });
        }
        else {
          res.json({ err: 0, success: false, msg: "没有该用户" });
        }
      }
    })
  });

  router.post("/user/login", validate({ body: schema.login }), authSchema, function (req, res) {
    if (req.body.userid != null && req.body.passwd != null) {
      dbops.findOne("Users", { userid: req.body.userid, passwd: req.body.passwd }, function (error, result) {
        if (error) {
          res.json({ error: 1, success: false, msg: "system error" })
        }
        else {
          if (result) {
            req.session.user = req.body.userid;
            userlog(req.session.user, "登陆成功");
            res.json({
              error: 0,
              success: true,
              msg: "登陆成功",
            });
          }
          else {
            res.json({ error: 0, success: false, msg: "帐号,密码不匹配" });
          }
        }
      })
    }
  });

  router.post("/user/changepasswd", authUser, function (req, res) {
    //修改密码
    //req={userid:"admin",oldpasswd:"admin",newpasswd:"admin1"}
    if (req.body.userid) {
      dbops.findOne('Users', { 'userid': req.body.userid }, (err, doc) => {
        //判断是否可以找到用户数据且用户请求的是自身的数据
        //并且原来的密码跟数据库中的密码是匹配的
        if (doc && doc.passwd == req.body.oldpasswd) {
          dbops.updateOne('Users', { 'userid': req.body.userid }, { 'passwd': req.body.newpasswd }, function (err, doc) {
            if (err) {
              message = "更改密码失败";
              res.json({ err: 0, success: false, msg: "更改密码失败" })

            }
            else {
              message = "更改密码成功";
              userlog(req.session.user, message);
              res.json({ err: 0, success: true, msg: "更改密码成功" });
            }
          });
        } else {
          message = "更改密码失败";
          res.json({ err: 0, success: false, msg: "更改密码失败" });
        }
      });
    } else {
      message = "更改密码失败";
      res.json({ err: 1, success: false, msg: "更改密码失败" });
    }
  });



  router.post("/user/changeuserinformation", authUser, validate({ body: schema.changeuserinformation }), authSchema, function (req, res) {
    //修改个人资料
    //req= {
    // userid:  /string 
    // username: /string
    // birthday:  /string
    // sex:   /string __0 is man  1is woman
    // job: /string
    // photo: ""
    // }

    var updateitem = {
      username: req.body.username,
      birthday: req.body.birthday,
      habit: req.body.habit,
      email: req.body.email,
      weixin: req.body.weixin,
      qq: req.body.qq,
      phone: req.body.phone,
      joinday: req.body.joinday,
      area: req.body.area,
      sex: req.body.sex,
      job: req.body.job,
      photo: req.body.photo
    }
    dbops.updateOne("Users", { userid: req.body.userid }, updateitem, function (err, result) {
      if (err) {
        res.json({ error: 1, success: false, msg: "system error" });
      }
      else {
        if (result) {
          userlog(req.session.user, "修改个人信息成功");
          res.json({ error: 0, success: true, msg: "修改数据成功" });
        }
        else {
          res.json({ error: 0, success: false, msg: "更新数据失败" })
        }
      }
    });
  });
  router.post("/user/getpersonlist", authUser, validate({ body: schema.getpersonlist }), authSchema, checkpermisson, function (req, res) {
    //先查看权限
    //req={userid:userid}
    var list = [];

    dbops.findMany("Users", {}, function (err, result) {
      if (err) {
        res.json({ error: 1, success: false, msg: "system error" });
      }
      else {

        for (var i = 0; i < result.length; i++) {
          var item = {
            userid: result[i].userid,
            username: result[i].username,
            level: result[i].level
          }
          list.push(item);
        }
        userlog(req.session.user, "获得了权限列表");
        res.json({ error: 0, msg: "获得人的列表成功", success: 1, personlist: list });
      }
    });
  });
  //修改权限 
  router.post("/user/changepermission", authUser, checkpermisson, function (req, res) {
    //req={userid:**,changeuserid,level:***}
    dbops.updateOne("Users", { userid: req.body.changeuserid }, { level: req.body.level }, function (err, doc) {
      if (err) {
        res.json({ err: 1, success: false, msg: "system error" });
      }
      else {
        res.json({ err: 0, success: true, msg: "修改权限成功" });
      }
    });
  });

  router.post('/user/photo', upload.single("photo"), function (req, res) {
    path = req.file.path.split("public")[1];
    res.json({ path: path });
  });

  // router.post("/user/log", authUser, checkpermisson, function (req, res) {
  //   //处理Log之后 返回给用户
  //   fs.readFileSync("../log/access.log","utf-8");
  //   console.log(data);  
  // });
  router.post("/user/log", function (req, res) {
    //让用户把时间传到后台 如果时间的误差太大 就不让他看~!
    //判断是不是今天的,如果是今天的就不用家日期,如果不是今天的就再后面追加上日期

    dbops.findOne("Users", { userid: req.body.id }, function (err, doc) {
      if (err) {
        res.json({ err: 1, success: false, msg: "system error" });
      }
      else {
        nowdate = ss.format(new Date(), '-YYYY-MM-DD');
        var file;
        if (req.body.date == nowdate) {
          file = "log/access.log";
        }
        else {
          file = "log/access.log" + req.body.date
        }
        data = fs.readFileSync(file, "utf-8");
        var arr = data.split("\n");
        if (doc && doc.level == 0 && req.body.userlist == 'All') { // 获取全部用户日志
          res.json({ err: 0, success: true, msg: "成功", log: arr });
        }
        else { // 获取指定用户日志
          var arrPer = ""; // 
          arr.forEach(function(element) {
            var userData = element.split('|')
            // var userData = {
            //   time: data[0].slice(1, 20),
            //   id: data[1],
            //   operate: data[2]
            // }
            if(doc && doc.level == 0 && userData[1] == req.body.userlist){
              arrPer += element + '\n';
            }else if(doc && doc.level != 0 && userData[1] == req.body.id){
              arrPer += element + '\n';
            }
          }, this);
          res.json({ err: 0, success: true, msg: "成功", log: arrPer.split("\n") });
        }
      }
    });
  });
  router.get("/user/getuserslist", function (req, res) {
    //先查看权限
    //req={userid:userid}
    var list = [];

    dbops.findMany("Users", {}, function (err, result) {
      if (err) {
        res.json({ error: 1, success: false, msg: "system error" });
      }
      else {
        result.forEach(function(element) {
          list.push(element.userid);
        }, this);

        res.json({ error: 0, msg: "获得账号列表成功", success: 1, userslist: list });
      }
    });
  });
  router.post("/user/forgetpasswd", setTOInitialPasswd, function (req, res) {//userid 
    dbops.findOne("Users", { userid: req.body.userid }, function (err, result) {
      if (err) {
        res.json({ err: 1, success: false, msg: "system error" });
      }
      else {
        if (result) {
          forgetmailTo(result.email, "123456")
          res.json({ err: 0, success: true, msg: "已经将您的密码发送至您的邮箱,可能会在垃圾邮箱，请注意查收！" });
        }
        else {
          res.json({ err: 0, success: false, msg: "帐号错误" });
        }
      }
    });
  });
}
