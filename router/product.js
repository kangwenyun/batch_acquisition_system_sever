var dbops = require("../dbops");
//
var log4js = require('log4js')
log4js.configure('./config/log4js.json');
var logger = log4js.getLogger("http");
//
var async = require("async");
var validate = require('express-jsonschema').validate;
var schema = require('../schema/product.js');
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
    function adddata(oneproduct) {
        dbops.findOne("Product", { productid: oneproduct.productid }, function (err, hasone) {
            if (err) {
                console.log("database error");
            }
            else {
                if (hasone) {
                    console.log("有相同的货物，添加失败");
                }
                else {
                    //------------------------------------------------------------
                    var ss = require('silly-datetime');
                    var time = ss.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                    dbops.findOne("Batch", { batchid: oneproduct.batchid }, function (err, result) {
                        if (err) {
                            console.log({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            if (result) {
                                 batchcurrentamount = parseInt(result.batchcurrentamount) + 1;
                                dbops.updateOne("Batch", { batchid: oneproduct.batchid }, { batchcurrentamount: batchcurrentamount }, function (err, result) {
                                    if (err) {
                                        console.log({ error: 1, success: false, msg: "system error" });
                                    }
                                    else {

                                        dbops.distinct("Product", "number", { batchid: oneproduct.batchid }, function (err, values) {
                                            if (err) {

                                                console.log({ error: 1, success: false, msg: "system error" });
                                            }
                                            else {
                                                var currentnumber;
                                                if (values.length == 0) {
                                                    currentnumber = 1;
                                                }
                                                else {
                                                    currentnumber = Math.max.apply(Math, values) + 1;
                                                }

                                                insertitem =
                                                    {
                                                        productid: oneproduct.productid,
                                                        batchid: oneproduct.batchid,
                                                        number: currentnumber,
                                                        type_length: oneproduct.type_length,
                                                        type_high: oneproduct.type_high,
                                                        type_width: oneproduct.type_width,
                                                        tray: oneproduct.tray,
                                                        time: time,
                                                        flag: oneproduct.flag
                                                    }
                                                dbops.insertOne("Product", insertitem, function (err, result) {
                                                    if (err) {

                                                        console.log({ error: 1, success: false, msg: "system error" });
                                                    }
                                                    else {
                                                        console.log(insertitem);
                                                        //新货物
                                                        global.socketio.emit("message","message", "货物："+oneproduct.productid+"入库，请注意查收");
                                                        console.log({ error: 0, success: true, msg: "添加货物成功" });
                                                    }
                                                })
                                            }
                                        });
                                    }
                                });
                            }
                            else { //不存在这个Batch的情况
                                dbops.distinct("Product", "number", { batchid: oneproduct.batchid }, function (err, values) {
                                    if (err) {
                                        console.log({ error: 1, success: false, msg: "system error" });
                                    }
                                    else {
                                        var currentnumber;
                                        if (values.length == 0) {
                                            currentnumber = 1;
                                            console.log("123")
                                        }
                                        else {
                                            currentnumber = Math.max.apply(Math, values) + 1;
                                        }
                                        console.log(values);
                                        insertitem = {
                                            productid: oneproduct.productid,
                                            batchid: oneproduct.batchid,
                                            number: currentnumber,
                                            type_length: oneproduct.type_length,
                                            type_high: oneproduct.type_high,
                                            type_width: oneproduct.type_width,
                                            tray: oneproduct.tray,
                                            time: time,
                                            flag: oneproduct.flag
                                        }
                                        dbops.insertOne("Product", insertitem, function (err, result) {
                                            if (err) {
                                                console.log({ error: 1, success: false, msg: "system error" });
                                            }
                                            else {
                                                console.log(insertitem);
                                                global.socketio.emit("message", "message", "货物："+oneproduct.productid+"入库，请注意查收");
                                                console.log({ error: 0, success: true, msg: "添加货物成功" });

                                            }
                                        })
                                    }
                                });
                            }
                        }
                    });
                    //------------------------------------------------------------
                }
            }
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

    //存在一个关于flag的问题
    //       batchid:"",
    //       number:"",
    //       type_length:"",
    //       type_high:"",
    //       type_width:"",
    //       time:"",
    //       flag:""
    function checkthesame(req, res, next) {
        dbops.findOne("Product", { productid: req.body.productid }, function (err, result) {

            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                if (result) {
                    console.log("存在相同id的货物");
                    res.json({ error: 0, success: false, msg: "有相同的货物，无法添加" });
                }
                else {
                    next();
                }
            }
        });
    }


    //checkthesame,
    router.post("/product/QaddDataWhileRefreshBatch2", validate({ body: schema.QaddDataWhileRefreshBatch2 }), authSchema, checkthesame, function (req, res) {
        //添加货物  都是string类型 主要是安卓端用
        // req = {
        //     productid: req.body.productid,
        //     batchid: req.body.batchid,
        //     type_length: req.body.type_length,
        //     type_high: req.body.type_high,
        //     type_width: req.body.type_width,
        //     tray: req.body.tray,
        //     time: req.body.time,
        //     flag: req.body.flag
        // }
        var ss = require('silly-datetime');
        var time = ss.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
        dbops.findOne("Batch", { batchid: req.body.batchid }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                if (result) {
                    batchcurrentamount = parseInt(result.batchcurrentamount) + 1;
                    dbops.updateOne("Batch", { batchid: req.body.batchid }, { batchcurrentamount: batchcurrentamount }, function (err, result) {
                        if (err) {
                            res.json({ error: 1, success: false, msg: "system error" });
                        }
                        else {

                            dbops.distinct("Product", "number", { batchid: req.body.batchid }, function (err, values) {
                                if (err) {

                                    res.json({ error: 1, success: false, msg: "system error" });
                                }
                                else {
                                    var currentnumber;
                                    if (values.length == 0) {
                                        currentnumber = 1;
                                    }
                                    else {
                                        currentnumber = Math.max.apply(Math, values) + 1;
                                    }

                                    insertitem =
                                        {
                                            productid: req.body.productid,
                                            batchid: req.body.batchid,
                                            number: currentnumber,
                                            type_length: req.body.type_length,
                                            type_high: req.body.type_high,
                                            type_width: req.body.type_width,
                                            tray: req.body.tray,
                                            time: time,
                                            flag: req.body.flag
                                        }
                                    dbops.insertOne("Product", insertitem, function (err, result) {
                                        if (err) {

                                            res.json({ error: 1, success: false, msg: "system error" });
                                        }
                                        else {
                                            console.log(insertitem);
                                            //新货物   "message", "货物："+req.body.productid+"入库，请注意查收"
                                            global.socketio.emit("message",  "货物："+req.body.productid+"入库，请注意查收");
                                            res.json({ error: 0, success: true, msg: "添加货物成功" });
                                        }
                                    })
                                }
                            });
                        }
                    });

                }
                else { //不存在这个Batch的情况
                    dbops.distinct("Product", "number", { batchid: req.body.batchid }, function (err, values) {
                        if (err) {
                            res.json({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            var currentnumber;
                            if (values.length == 0) {
                                currentnumber = 1;
                                console.log("123")
                            }
                            else {
                                currentnumber = Math.max.apply(Math, values) + 1;
                            }
                            console.log(values);
                            insertitem = {
                                productid: req.body.productid,
                                batchid: req.body.batchid,
                                number: currentnumber,
                                type_length: req.body.type_length,
                                type_high: req.body.type_high,
                                type_width: req.body.type_width,
                                tray: req.body.tray,
                                time: time,
                                flag: req.body.flag
                            }
                            dbops.insertOne("Product", insertitem, function (err, result) {
                                if (err) {
                                    res.json({ error: 1, success: false, msg: "system error" });
                                }
                                else {
                                    console.log(insertitem);
                                    global.socketio.emit("message", "货物："+req.body.productid+"入库，请注意查收");
                                    res.json({ error: 0, success: true, msg: "添加货物成功" });

                                }
                            })
                        }
                    });
                }
            }
        });
    });

    router.post("/product/QdeleteDataWhileRefreshBatch", validate({ body: schema.QdeleteDataWhileRefreshBatch }), authSchema, function (req, res) {
        //删除数据
        //传递该货物的  batchid 和 productid
        dbops.findOne("Batch", { batchid: req.body.batchid }, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                if (result) {
                    if (result.batchcurrentamount != 0) {
                       batchcurrentamount = parseInt(result.batchcurrentamount) - 1;
                    }
                    dbops.updateOne("Batch", { batchid: req.body.batchid }, { batchcurrentamount: batchcurrentamount }, function (err, result) {
                        if (err) {
                            res.json({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            dbops.deleteOne("Product", { productid: req.body.productid }, function (err, result) {
                                if (err) {
                                    res.json({ error: 1, success: false, msg: "system error" });
                                }
                                else {
                                    userlog(req.session.user, "删除了货物" + req.body.productid);
                                    res.json({ error: 0, success: true, msg: "删除货物成功" });
                                }
                            })
                        }
                    });

                }
                else {
                    dbops.deleteOne("Product", insertitem, function (err, result) {
                        if (err) {
                            res.json({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            userlog(req.session.user, "删除了货物" + req.body.productid);
                            res.json({ error: 0, success: true, msg: "删除货物成功" });
                        }
                    })
                }
            }
        });
    });

    router.get("/product/getproductlist", function (req, res) {
        //获得所有数据列表
        dbops.findMany("Product", {}, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                var productlist = [];
                for (var i = 0; i < result.length; i++) {
                    var temp = {
                        id: result[i]._id,
                        productid: result[i].productid,
                        batchid: result[i].batchid,
                        number: result[i].number,
                        type_length: result[i].type_length,
                        type_high: result[i].type_high,
                        type_width: result[i].type_width,
                        tray: result[i].tray,
                        time: result[i].time,
                        flag: result[i].flag
                    }
                    productlist.push(temp);
                }
                ress = {
                    productlist: productlist,
                    error: 0,
                    success: 1,
                    msg: "获得货物列表成功"
                }
                res.json(ress);
            }
        });
    });


    router.post("/product/changeproduct", validate({ body: schema.changeproduct }), authSchema, function (req, res) {
        //修改指定的货物数据
        //  req=   {
        //   "productid": "1",
        //   "batchid": "b11",
        //   "number": 1,
        //   "type_length": "1001",
        //   "type_high": "1001",
        //   "type_width": "1001",
        //   "tray": "T2",
        //   "time": "2017-04-19 14:54:26",
        //   "flag": "正确"
        // }
        updateitem = {
            batchid: req.body.batchid,
            productid: req.body.productid,
            number: req.body.number,
            type_length: req.body.type_length,
            type_high: req.body.type_high,
            type_width: req.body.type_width,
            tray: req.body.tray,
            time: req.body.time,
            flag: req.body.flag
        };
        dbops.updateOne("Product", { productid: req.body.productid }, updateitem, function (err, result) {
            if (err) {
                res.json({ error: 1, success: false, msg: "system error" });
            }
            else {
                if (result) {
                    userlog(req.session.user, "修改了货物" + req.body.productid);
                    res.json({ error: 0, success: true, msg: "修改成功" });
                }
                else {
                    res.json({ error: 0, success: false, msg: "修改失败" });
                }
            }
        });
    });

    router.get("/product/getproductthroughproductid", function (req, res) {
        // 通过货物号查看货物详情
        //req={productid:"1"}
        console.log(req.query);
        dbops.findOne("Product", { productid: req.query.productid }, function (err, result) {
            res.json({ result });
        });
    });

    router.get("/product/search", validate({ body: schema.search }), authSchema, function (req, res) {
        //输入货物号 比如输入1 可以查看1  11 12 13 14 这样的货物号 。
        dbops.findMany("Product", { "productid": { '$regex': ".*" + req.query.productid + ".*" } }, function (err, result) {
            if (err) {
                res.json({ err: 1, success: false, msg: "system error" });
            }
            else {
                productids = [];
                for (var i = 0; i < result.length; i++) {
                    var temp = { id: result[i].productid, type: "1" }
                    productids.push(temp);
                }
                res.json({ err: 0, success: true, msg: "成功获得搜索数据", list: productids });
            }
        })
    });

    router.get("/product/test", function (req, res) {
        oneproduct = {
            productid: "1",
            batchid: "2",
            type_length: "100",
            type_high: "100",
            type_width: "100",
            tray: "100",
            time: "100",
            flag: "100"

        }
        adddata(oneproduct)
    });
    router.post("/product/deleteallproduct", checkpermisson, function (req, res) {
        dbops.deleteAll("Product", function (err, resultt) {
            if (err) {
                res.json({ err: 1, success: false, msg: "database error" });
            }
            else {
                if (resultt.result.ok == 1) {
                    res.json({ err: 0, success: true, msg: "删除所有货物成功" });
                }
                else {
                    res.json({ err: 0, success: false, msg: "删除所有货物失败" })
                }
            }
        })
    });
    router.post("/product/addmanydata", function (req, res) {
       // console.log(req.body.list);
        var result = req.body.list;
        var successadd = [];
        var failadd = [];
        //数组
        var j = 0;
        async.whilst(
            function () {
                return j < result.length;   //true，则第二个函数会继续执行，否则，调出循环  
            },
            function (whileCb) { //循环的主体  
                // dbops.findOne("Product", { productid: result[j].productid }, function (err, doc) {
                //     if (doc) {//存在的话 就返回给用户
                //         failadd.push(doc.productid);
                //     }
                //     else {//不存在的话 就加入到数据库里面
                //         successadd.push(result[j].productid);
                //         adddata(result[j]);
                //     }
                //     j++
                //     whileCb();
                // });
                var oneproduct=result[j];
                 dbops.findOne("Product", { productid: oneproduct.productid }, function (err, hasone) {
            if (err) {
                console.log("database error");
            }
            else {
                if (hasone) {
                    console.log("有相同的货物，添加失败");
                     j++;
                     whileCb();
                }
                else {
                    //------------------------------------------------------------
                    var ss = require('silly-datetime');
                    var time = ss.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                    dbops.findOne("Batch", { batchid: oneproduct.batchid }, function (err, result) {
                        if (err) {
                            console.log({ error: 1, success: false, msg: "system error" });
                        }
                        else {
                            if (result) {
                                 batchcurrentamount = parseInt(result.batchcurrentamount) + 1;
                                dbops.updateOne("Batch", { batchid: oneproduct.batchid }, { batchcurrentamount: batchcurrentamount }, function (err, result) {
                                    if (err) {
                                        console.log({ error: 1, success: false, msg: "system error" });
                                    }
                                    else {

                                        dbops.distinct("Product", "number", { batchid: oneproduct.batchid }, function (err, values) {
                                            if (err) {

                                                console.log({ error: 1, success: false, msg: "system error" });
                                            }
                                            else {
                                                var currentnumber;
                                                if (values.length == 0) {
                                                    currentnumber = 1;
                                                }
                                                else {
                                                    currentnumber = Math.max.apply(Math, values) + 1;
                                                }

                                                insertitem =
                                                    {
                                                        productid: oneproduct.productid,
                                                        batchid: oneproduct.batchid,
                                                        number: currentnumber,
                                                        type_length: oneproduct.type_length,
                                                        type_high: oneproduct.type_high,
                                                        type_width: oneproduct.type_width,
                                                        tray: oneproduct.tray,
                                                        time: time,
                                                        flag: oneproduct.flag
                                                    }
                                                dbops.insertOne("Product", insertitem, function (err, result) {
                                                    if (err) {

                                                        console.log({ error: 1, success: false, msg: "system error" });
                                                    }
                                                    else {
                                                        console.log(insertitem);
                                                        //新货物
                                                 "货物："+oneproduct.productid+"入库，请注意查收"
                                                        global.socketio.emit("message", "货物："+oneproduct.productid+"入库，请注意查收");
                                                        console.log({ error: 0, success: true, msg: "添加货物成功" });
                                                         j++;
                                                         whileCb();
                                                    }
                                                })
                                            }
                                        });
                                    }
                                });
                            }
                            else { //不存在这个Batch的情况
                                dbops.distinct("Product", "number", { batchid: oneproduct.batchid }, function (err, values) {
                                    if (err) {
                                        console.log({ error: 1, success: false, msg: "system error" });
                                    }
                                    else {
                                        var currentnumber;
                                        if (values.length == 0) {
                                            currentnumber = 1;
                                            console.log("123")
                                        }
                                        else {
                                            currentnumber = Math.max.apply(Math, values) + 1;
                                        }
                                        console.log(values);
                                        insertitem = {
                                            productid: oneproduct.productid,
                                            batchid: oneproduct.batchid,
                                            number: currentnumber,
                                            type_length: oneproduct.type_length,
                                            type_high: oneproduct.type_high,
                                            type_width: oneproduct.type_width,
                                            tray: oneproduct.tray,
                                            time: time,
                                            flag: oneproduct.flag
                                        }
                                        dbops.insertOne("Product", insertitem, function (err, result) {
                                            if (err) {
                                                console.log({ error: 1, success: false, msg: "system error" });
                                            }
                                            else {
                                                console.log(insertitem);
                                                global.socketio.emit("message", "货物："+oneproduct.productid+"入库，请注意查收");
                                                console.log({ error: 0, success: true, msg: "添加货物成功" });
                                                j++;
                                                whileCb();
                                            }
                                        })
                                    }
                                });
                            }
                        }
                    });
                    //------------------------------------------------------------
                }
            }
        });
            },
            function (err) {         //here 如果条件不满足，或者发生异常  
                if (err) {
                    console.log(err + "1");
                }
                else {
                    console.log({success:"true",error:0,msg:"成功发送离线货物",
                  success:successadd,fail:failadd});
                  res.json({success:"true",error:0,msg:"成功发送离线货物",
                  success:successadd,fail:failadd})
                }
            }
        );
    });


}

