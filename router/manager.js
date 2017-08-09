var dbops = require("../dbops");
//
var log4js = require('log4js')
log4js.configure('./config/log4js.json');
var logger = log4js.getLogger("http");
//
var async = require("async");
var validate = require('express-jsonschema').validate;
//
//
module.exports = function (router) {
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


    router.post("/manager/getpersonlist", checkpermisson, function (req, res) {
        //先查看权限
        //req={userid:userid}
        var list = [];

        dbops.findManybylevel("Users", {}, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {

                for (var i = 0; i < result.length; i++) {
                    var item = {
                        userid: result[i].userid,
                        username: result[i].username,
                        level: result[i].level,
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

                res.json({ error: 0, msg: "获得人的列表成功", success: 1, personlist: list });
            }
        });
    });
    router.post("/manager/modifyperson", checkpermisson, function (req, res) {
        //req={userid:   changeuserid:   username:   level}  //userid是你自己的帐号检查权限用的，changeuserid这是要修改的信息
        dbops.updateOne("Users", { userid: req.body.changeuserid }, { username: req.body.username, level: req.body.level }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                res.json({ error: 0, msg: "修改成功", success: 1 });
            }
        })
    });
    router.post("/manager/deleteperson", checkpermisson, function (req, res) {
        //req={userid: deleteuserid:  }  //deleteuserid这是要删除的信息
        console.log(req.body.userid+req.body.deleteuserid)
        dbops.deleteOne("Users", { userid: req.body.deleteuserid }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                res.json({ error: 0, msg: "删除成功", success: 1 });
            }
        })
    });
    router.post("/manager/addperson", checkpermisson, function (req, res) {
        //req={userid: adduserid:  addpasswd: addusername:    addlevel: }  
        //userid是用来验证当前帐号是否有权限，  adduserid是添加的帐号的用户名  
        dbops.findMany("Users", { userid: req.body.adduserid }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                console.log(result.length);
                if (result.length == 0) {
                    dbops.insertOne("Users", { userid: req.body.adduserid, passwd:req.body.addpasswd,username: req.body.addusername, level: req.body.addlevel }, function (err, result1) {
                        if (err) {
                            res.json({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            res.json({ error: 0, msg: "添加成功", success: 1 });
                        }
                    });
                }
                else {
                    res.json({ error: 0, msg: "该帐号已存在", success: 0 });
                }
            }
        })
    });
}