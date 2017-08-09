//定义一个新的router
var router = require('express').Router();


//加载user模块到router里
require('./user.js')(router);
require('./product.js')(router);
require("./batch.js")(router);
require("./manager.js")(router);
require
//到处router模块
module.exports = router;
