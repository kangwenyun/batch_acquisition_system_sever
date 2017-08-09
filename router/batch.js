var dbops = require("../dbops");
var async = require("async");
//
//
var validate = require('express-jsonschema').validate;
var schema = require('../schema/batch.js');

//
var log4js = require('log4js')
log4js.configure('./config/log4js.json');
var logger = log4js.getLogger("http");

function userlog(session, dowhat) {
    console.log("|" + session + "|" + dowhat);
    logger.info("|" + session + "|" + dowhat);
}
module.exports = function (router) {
    function authSchema(err, req, res, next) {
        function userlog(session, dowhat) {
            console.log("用户：-" + session + "-" + dowhat);
            logger.info("用户：-" + session + "-" + dowhat);
        }
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
                    res.json({ error: 0, success: false, msg: "权限不够" });
                }
            }
        });
    }
    function checkthesame(req, res, next) {
        dbops.findOne("Batch", { batchid: req.body.batchid }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                if (result) {
                    res.json({ error: 0, success: false, msg: "存在重复的批次" });
                }
                else { next(); }
            }
        });
    }
    router.post("/batch/addbatch", validate({ body: schema.addbatch }), authSchema, checkthesame, function (req, res) {
        //添加批次
        // req={
        //     "batchid":"b0",
        //     "batchsum":"50",
        // }
        var myDate = new Date();
        var date = myDate.toLocaleDateString();
        dbops.findMany("Product", { batchid: req.body.batchid }, function (err, result) {
            insertitem = {
                batchid: req.body.batchid,
                batchsum: req.body.batchsum,
                batchcurrentamount: result.length,
                status: "unaccept",
                createtime: date
            }
            dbops.insertOne("Batch", insertitem, function (err, result) {
                if (err) {
                    res.json({ error: 1, success: false, msg: "system error" });
                }
                else {
                    if (result) {
                        userlog(req.session.user, "添加批次成功:" + req.body.batchid);
                        res.json({ error: 0, success: true, msg: "添加批次成功:" + req.body.batchid });
                    }
                    else {
                        res.json({ error: 0, success: false, msg: "添加批次失败:" + req.body.batchid });
                    }
                }
            });
        });
    });

    router.get("/batch/getallBatch", function (req, res) {
        //获得所有批次的信息
        var unaccept = [];
        var accept = [];
        var check = [];
        var finish = [];
        dbops.findMany("Batch", {}, function (err, result) {
            if (err) {
                res.json({ error: 0, msg: "system error", success: false });
            }
            else {
                for (var i = 0; i < result.length; i++) {
                    insertitem = {
                        id: result[i].id,
                        createtime: result[i].createtime,
                        batchid: result[i].batchid,
                        batchsum: result[i].batchsum,
                        batchcurrentamount: result[i].batchcurrentamount,
                        status: result[i].status
                    };
                    if (result[i].status == "unaccept") {
                        unaccept.push(insertitem);
                    }
                    else if (result[i].status == "accept") {
                        accept.push(insertitem);
                    }
                    else if (result[i].status == "check") {
                        check.push(insertitem);
                    }
                    else {
                        finish.push(insertitem);
                    }
                }
                var response = {
                    unaccept: unaccept,
                    accept: accept,
                    check: check,
                    finish: finish,
                    msg: "获得所有的成功",
                    success: true,
                    error: 0
                }
                res.json(response);
            }
        });
    });

    router.post("/batch/unaccepttoacceptBatch", validate({ body: schema.unaccepttoacceptBatch }), authSchema, function (req, res) {

        dbops.findOne("Batch", { batchid: req.body.batchid }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                if (result.status == "unaccept") {
                    dbops.updateOne("Batch", { batchid: req.body.batchid }, { status: "accept" }, function (err, result) {
                        if (err) {
                            res.json({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            if (result) {
                                userlog(req.session.user, "接受批次" + req.body.batchid + "成功");
                                res.json({ error: 0, success: true, msg: "成功" });
                            }
                            else {
                                res.json({ error: 0, success: false, msg: "失败" });
                            }
                        }
                    });
                }
                else {
                    res.json({ error: 0, success: false, msg: "失败" });
                }
            }
        });

    });

    router.post("/batch/accepttocheckBatch", validate({ body: schema.accepttocheckBatch }), authSchema, function (req, res) {
        dbops.findOne("Batch", { batchid: req.body.batchid }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                if (result.status == "accept") {
                    dbops.updateOne("Batch", { batchid: req.body.batchid }, { status: "check" }, function (err, result) {
                        if (err) {
                            res.json({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            if (result) {
                                userlog(req.session.user, "提交批次" + req.body.batchid + "成功");
                                res.json({ error: 0, success: true, msg: "成功" });
                            }
                            else {
                                res.json({ error: 0, success: false, msg: "失败" });
                            }
                        }
                    });
                }
                else {
                    res.json({ error: 0, success: false, msg: "失败" });
                }
            }
        });

    });
    router.post("/batch/checktofinishBatch", validate({ body: schema.checktofinishBatch }), authSchema, function (req, res) {
        dbops.findOne("Batch", { batchid: req.body.batchid }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                if (result.status == "check") {
                    dbops.updateOne("Batch", { batchid: req.body.batchid }, { status: "finish" }, function (err, result) {
                        if (err) {
                            res.json({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            if (result) {
                                res.json({ error: 0, success: true, msg: "成功" });
                            }
                            else {
                                res.json({ error: 0, success: false, msg: "失败" });
                            }
                        }
                    });
                }
                else {
                    res.json({ error: 0, success: false, msg: "失败" });
                }
            }
        });

    });
    router.post("/batch/checktoacceptBath", validate({ body: schema.checktoacceptBath }), authSchema, function (req, res) {
        dbops.findOne("Batch", { batchid: req.body.batchid }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                if (result.status == "check") {
                    dbops.updateOne("Batch", { batchid: req.body.batchid }, { status: "accept" }, function (err, result) {
                        if (err) {
                            res.json({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            if (result) {
                                res.json({ error: 0, success: true, msg: "成功" });
                            }
                            else {
                                res.json({ error: 0, success: false, msg: "失败" });
                            }
                        }
                    });
                }
                else {
                    res.json({ error: 0, success: false, msg: "失败" });
                }
            }
        });

    });
    router.post("/batch/getbatchInformation", validate({ body: schema.getbatchInformation }), authSchema, function (req, res) {
        //获得具体的batch的信息
        //req={batchid:"b0"}
        dbops.findOne("Batch", { batchid: req.body.batchid }, function (err, result) {
            res.json({
                batchid: result.batchid,
                batchsum: result.batchsum,
                batchcurrentamount: result.batchcurrentamount,
                status: result.status,
                createtime: result.createtime
            });
        });
    });


    router.post("/batch/getBatchDetialThroughBatchid", validate({ body: schema.getBatchDetialThroughBatchid }), authSchema, function (req, res) {
        //
        //{batchid:"b0"}
        var j = 0;
        var tray = [];
        var response = { list: [] };
        dbops.distinct("Product", "tray", { batchid: req.body.batchid }, function (err, result) {

            async.whilst(
                function () {
                    return j < result.length;   //true，则第二个函数会继续执行，否则，调出循环  
                },
                function (whileCb) { //循环的主体  
                    dbops.findMany("Product", { tray: result[j], batchid: req.body.batchid }, function (err, doc) {
                        console.log(doc[0]);
                        response.list.push(doc);
                        j++
                        whileCb();
                    });
                },
                function (err) {         //here 如果条件不满足，或者发生异常  
                    if (err) {
                        console.log(err + "1");
                    }
                    else {
                        response.success = true;
                        response.error = 0;
                        response.msg = "获得数据成功";
                        res.json(response);

                    }
                }
            );
        });
    });
}
