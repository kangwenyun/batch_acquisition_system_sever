var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
global.socketio = io;
var cluster = require('express-cluster');
var log4js = require('log4js')
const fs = require('fs');
var path = require('path');
var cookie = require("cookie");
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var session = require('express-session');
var dbops = require("./dbops")
////
if("2017-05-03 17:12:23">"2017-05-03 17:12:21")
{
console.log("1");
}
else
{
console.log("2");
}
//log
if (!fs.existsSync("./log")) {
	fs.mkdirSync("./log");
}//判断是否存在文件夹
log4js.configure('./config/log4js.json');//配置日志
var logger = log4js.getLogger("http");
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));    //设置 views 路径
app.engine("html", require("ejs").__express); // 加载ejs模板
app.set('view engine', 'html');
app.use(bodyParser.urlencoded()); //处理urlencoded格式body
app.use(bodyParser.json()); //处理json格式body
app.use(express.static(path.join(__dirname, 'public')));

const COOKIE_SECRET = 'secret',
	COOKIE_KEY = 'express.sid';
//----------------------------------
var sessionStore = new session.MemoryStore();
app.use(session({
	store: sessionStore,
	secret: 'secret',
	key: 'express.sid'
}));
//------------------------------------------
var router = require('./router');
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
	res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
	if (req.method == 'OPTIONS') {
		res.send(200);
	} else {
		next();
	}
});
app.get("/", function (req, res) {
	res.render("index");
})
app.use('/v1', router);
app.use(function (req, res) {
	res.sendStatus(404);
});


//--------------------------------------------------------------------------
// io.use(function (socket, next) { //对socket.io进行配置中间件，处理socket，这里获取socket连接的sessionID
// 	//console.log("a socket connect");
// 	var data = socket.handshake || socket.request;
// 	if (data.headers.cookie) {
// 		//console.log("socket data exist");
// 		data.cookie = cookie.parse(data.headers.cookie);  //从socket连接中获得cookie信息
// 		//console.log(data.cookie);
// 		data.sessionID = cookieParser.signedCookie(data.cookie[COOKIE_KEY], COOKIE_SECRET);
// 		//得到的是cookie_key就是 express.sid:中的信息 //也就是token中的信息
// 		data.sessionStore = sessionStore;
// 		//console.log(data.sessionID);
// 		//根据sessionid找username
// 		sessionStore.get(data.sessionID, function (err, session) {
// 			if (session == null) {
// 				//console.log(session);
// 				console.log("No session");
// 				return next(new Error('session not found'))
// 			} else {
// 				//console.log(session);
// 				data.session = session;
// 				data.session.id = data.sessionID;
// 				next();
// 			}
// 		});
// 	} else {
// 		return next(new Error('Missing cookie headers'));
// 	}
// });



io.on('connection', function (socket) {
    // var session = socket.handshake.session;
	// console.log("session:" + session.user+" connect");
	// //连上socketio以后 查看Product表中是否有时间大于leavetime的 如果有的话就发送一个消息 就告诉用户 存在货物更新
	// if (session.user) {	
	// dbops.findOne("Users",{userid:session.user},function(err,result)
	// {   
	// 	if(err)
	// 	{
	// 		console.log("error")
	// 	}
	// 	else
	// 	{
			
	// 		if(result)
	// 		{
    //            var leave=result.leavetime;
	// 		   console.log(leave);
	// 		   dbops.findMany("Product",{time:{"$gte":leave}},function(err,result)
	// 		   {
    //               if(result.length!=0){
    //                  socket.emit("newproduct","有新的货物");
	// 				 console.log("有新的货物");
	// 			  }
	// 			  else
	// 			  {
	// 				  console.log("没有新的货物");
	// 			  }
	// 		   });   
	// 		}
	// 		else{
	// 			  console.log("没有");
	// 		}
	// 	}
	// });
	// }
	//socket操作
	console.log('1212')
	socket.emit("message", "有新的货物：p1加入库中");

	socket.on("newmessage", function (data) {
		console.log(data);
	})
	
	
	
	//处理用户断开链接
	socket.on('disconnect', function () {
		// if (session.user) {	
			if(0) {	
			var ss = require('silly-datetime');
			var leavetime = ss.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
			console.log(leavetime);
			dbops.updateOne("Users", { userid: session.user }, { leavetime:leavetime}, function (err, result) {
               if(err)
			   {
                console.log("err");
			   }
			   else
			   {
                console.log(session.user + ' has disconnect at'+ leavetime);
			   }
			});
		}
		else {
			console.log('someone has disconnect');
		}
	});


});

http.listen(3000, function () {
	console.log('Example app listening 3000');
});

