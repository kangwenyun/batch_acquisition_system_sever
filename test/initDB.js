const process = require('process');
var arguments = process.argv.splice(2);
var perspective = {
  photo: true
}
for (index in arguments) {
  switch (arguments[index]) {
    case 'nophoto':
      perspective.photo = false;
  }
}

const dbops = require('../dbops');
const async = require('async');
const fs = require('fs');
dbops.callback = function () {
  async.waterfall([
    function (callback) {
      dbops.deleteAll('checkUsers', (err, res) => {
        if (res.result.ok == 1) {
          callback(null);
        }
        else {
          callback('deleteAll')
        }
      });
    },
    function (callback) {
      dbops.deleteAll('Users', (err, res) => {
        if (res.result.ok == 1) {
          callback(null);
        }
        else {
          callback('deleteAll')
        }
      });
    },
    function (callback) {
      dbops.deleteAll('Product', (err, res) => {
        if (res.result.ok == 1) {
          callback(null);
        }
        else {
          callback('deleteAll')
        }
      });
    },
    function (callback) {
      dbops.deleteAll('Batch', (err, res) => {
        if (res.result.ok == 1) {
          callback(null);
        }
        else {
          callback('deleteAll')
        }
      });
    },

    function (callback) {
      if (perspective.photo) {
        var imgBuffer1 = fs.readFileSync(__dirname + '/avatar1.jpg');
        var photo1 = imgBuffer1.toString('base64');
        var imgBuffer2 = fs.readFileSync(__dirname + '/avatar2.jpg');
        var photo2 = imgBuffer2.toString('base64');
      } else {
        var photo1 = '';
        var photo2 = '';
      }

      var insertItems =
       [{
          userid: 'admin',
          passwd: 'f%C5%D1%D6%D7',
          username: "admin",
          birthday: "1994-1-1",
          habit: "play football",
          email: "123@qq.com",
          weixin: "123456",
          area:["上海","虹桥","xx路"],
          joinday:"2001-12-12",
          qq: "1234567",
          phone: "1313131314",
          sex: "0",
          job: "manager",
          photo: "/admin.jpg",
          level:0
        },
        {
          userid: 'user1',
          passwd: 'z%E8%D8%D7%A3',
          username: "user1",
          birthday: "1994-1-1",
          habit: "play football",
          email: "798218157@qq.com",
          weixin: "123456",
          area:["上海","虹桥","xx路"],
          joinday:"2001-12-12",
          qq: "1234567",
          phone: "1313131314",
          sex: "0",
          job: "manager",
          photo: "/admin.jpg",
          level:1
        },
        {
          userid: 'admin1',
          passwd: 'admin1',
          username: "admin1",
          birthday: "1994-1-1",
          habit: "play football",
          email: "123@qq.com",
          weixin: "123456",
          area:["上海","虹桥","xx路"],
          joinday:"2001-12-12",
          qq: "1234567",
          phone: "1313131314",
          sex: "0",
          job: "manager",
          photo: "/admin.jpg",
          level:0
        }]

      dbops.insertMany('Users', insertItems, (err, res) => {
        if (res.result.ok == 1) {
          callback(null);
        } else {
          callback('UserInfo InsertMany');
        }
      });
    }, function (callback) {
      var insertItems =
       [ {
          userid: 'user1',
          passwd: 'z%E8%D8%D7%A3',
          username: "user1",
          birthday: "1994-1-1",
          habit: "play football",
          email: "1157211454@qq.com",
          weixin: "123456",
          area:["上海","浦东区","建设路"],
          joinday:"2001-12-12",
          qq: "1234567",
          phone: "1313131314",
          sex: "0",
          job: "manager",
          photo: "/admin.jpg",
          level:-1
        }, {
          userid: 'user2',
          passwd: 'user2',
          username: "user2",
          birthday: "1994-1-1",
          habit: "play football",
          email: "1157211454@qq.com",
          weixin: "123456",
          area:["上海","嘉定","福海路"],
          joinday:"2001-12-12",
          qq: "1234567",
          phone: "1313131314",
          sex: "0",
          job: "manager",
          photo: "/admin.jpg",
          level:-1
        }, {
          userid: 'user3',
          passwd: 'user3',
          username: "user3",
          birthday: "1994-1-1",
          habit: "play football",
          email: "1157211454@qq.com",
          weixin: "123456",
          area:["上海","普陀区","普陀路"],
          joinday:"2001-12-12",
          qq: "1234567",
          phone: "1313131314",
          sex: "0",
          job: "manager",
          photo: "/admin.jpg",
          level:-1
        }]

      dbops.insertMany('checkUsers', insertItems, (err, res) => {
        if (res.result.ok == 1) {
          callback(null);
        } else {
          callback('UserInfo InsertMany');
        }
      });
    },
    function (callback) {
      var orderItem = [
        {
          batchid: 'b0',
          batchsum: '50',
          batchcurrentamount: '0',
          createtime: '2015/01/01',
          status: 'unaccept'
        },
        {
          batchid: 'b1',
          batchsum: '50',
          batchcurrentamount: '2',
          createtime: '2015/01/01',
          status: 'accept'
        },
        {
          batchid: 'b2',
          batchsum: '50',
          batchcurrentamount: '2',
          createtime: '2015/01/01',
          status: 'accept'
        },
        {
          batchid: 'b3',
          batchsum: '50',
          batchcurrentamount: '0',
          createtime: '2015/01/01',
          status: 'unaccept'
        },
        {
          batchid: 'b4',
          batchsum: '50',
          batchcurrentamount: '0',
          createtime: '2015/01/01',
          status: 'check'
        }
      ];
      dbops.insertMany('Batch', orderItem, (err, res) => {
        if (res.result.ok == 1) {
          callback(null);
        } else {
          callback('Batch InsertMany');
        }
      });
    },
    function (callback) {
      var products = [
        {
          "productid": "1",
          "batchid": "b1",
          "number": 1,
          "type_length": "100",
          "type_high": "100",
          "type_width": "100",
          "tray": "T1",
          "time": "2017-05-10 14:54:26",
          "flag": "正确"
        },
        {
          "productid": "2",
          "batchid": "b1",
          "number": 2,
          "type_length": "100",
          "type_high": "100",
          "type_width": "100",
          "tray": "T1",
          "time": "2017-04-19 14:54:27",
          "flag": "正确"
        },
        {
          "productid": "3",
          "batchid": "b2",
          "number": 1,
          "type_length": "100",
          "type_high": "100",
          "type_width": "100",
          "tray": "T2",
          "time": "2017-04-19 14:54:16",
          "flag": "正确"
        },
        {
          "productid": "4",
          "batchid": "b2",
          "number": 2,
          "type_length": "100",
          "type_high": "100",
          "type_width": "100",
          "tray": "T2",
          "time": "2017-04-19 14:54:17",
          "flag": "正确"
        },
      ];
      dbops.insertMany('Product', products, (err, res) => {
        if (res.result.ok == 1) {
          callback(null);
        } else {
          callback('OrderInfo InsertMany');
        }
      });
    }],
    function (err) {
      console.log('finish', err);
      dbops.disconnect();
    });
}
