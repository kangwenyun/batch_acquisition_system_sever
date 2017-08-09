const async = require('async');
const assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/Capture';

//todo:这里需要添加条件等待
class DBops {
  constructor() {
    var that = this;
    this.db = null;
    this.callback = null;
    MongoClient.connect(url, function (err, idb) {
      assert.equal(null, err);
      console.log('connected success');
      that.db = idb;
      if (that.callback) {
        that.callback();
      }
    });
  }

  disconnect() {
    this.db.close();
  }

  insertOne(collectionName, insertItem, callback) {
    var collection = this.db.collection(collectionName);
    collection.insert(insertItem, callback);
  }
  deleteOne(collectionName, insertItem, callback) {
    var collection = this.db.collection(collectionName);
    collection.remove(insertItem, callback);
  }
  findMany(collectionName,insertItem,callback)
  {
    var collection = this.db.collection(collectionName);
    collection.find(insertItem).toArray(callback);
  }
  findManybylevel(collectionName,insertItem,callback)
  {
    var collection = this.db.collection(collectionName);
    collection.find(insertItem).sort({"level":1}).toArray(callback);
  }
  insertMany(collectionName, insertItems, callback) {
    var collection = this.db.collection(collectionName);
    collection.insert(insertItems, callback);
  }

  findOne(collectionName, key, callback) {
    var collection = this.db.collection(collectionName);
    collection.findOne(key, callback);
  }
  distinct(collectionName,field,conditions,callback)
  {
    var collection= this.db.collection(collectionName);
    collection.distinct(field,conditions,callback);
  }
  updateOne(collectionName, key, updateData, callback) {
    var collection = this.db.collection(collectionName);
    collection.updateOne(key, { $set: updateData }, callback);
  }

  existAndCreatelist(UserInfo, OrderList, key, callback1) {
    var userinfo = this.db.collection(UserInfo);
    var orderlist = this.db.collection(OrderList);
    async.waterfall([function (callback) {
      userinfo.find(key).toArray((err, docs) => {//返回的是数组
        assert.equal(err, null);
        //console.log(docs);
        if (docs.length == 0) {
          callback(1, docs);
          console.log(docs.userid);
        }
        else {
          callback(null, docs);
        }
      });
    }, function (docs, callback) {
      //console.log(docs[0].info.group);//数组的问题
      //开发部A组
      orderlist.find({ 'partment': docs[0].info.partment, 'group': docs[0].info.group }).toArray(function (err, items) {

        //console.log(docs);
        // console.log(docs.group);
        var unaccept = [];
        var accept = [];
        var checking = [];
        var finished = [];
        var finallist = {};
        if (items.length == 0) {
          finallist.success = true;
          finallist.err = 0;
          finallist.msg = "no order";
          return callback(null, finallist);
        }
        for (var i = 0; i < items.length; i++) {
          if (items[i].status == "accept") {
            var orderitem = {};
            orderitem.orderid = items[i].orderid;
            orderitem.ordertime = items[i].ordertime;
            orderitem.status="accept"
            accept.push(orderitem);
          }
          if (items[i].status == "unaccept") {
            var orderitem = {};
            orderitem.orderid = items[i].orderid;
            orderitem.ordertime = items[i].ordertime;
            orderitem.status="unaccept"
            unaccept.push(orderitem);
          }
          if (items[i].status == "checking") {
            var orderitem = {};
            orderitem.orderid = items[i].orderid;
            orderitem.ordertime = items[i].ordertime;
            orderitem.status="checking"
            checking.push(orderitem);
          }
          if (items[i].status == "finished") {
            var orderitem = {};
            orderitem.orderid = items[i].orderid;
            orderitem.ordertime = items[i].ordertime;
            orderitem.status="finished"
            finished.push(orderitem);
          }
        }
        finallist.accept = accept;
        finallist.unaccept = unaccept;
        finallist.checking = checking;
        finallist.finished = finished;
        finallist.success = true;
        finallist.err = 0;
        finallist.msg = "success";
        return callback(null, finallist);
      });
    }], callback1);
  }

  //函数的命名规则，想这个就是值如果找到的话返回，没找到就插入新的。
  //比如在注册用户的场景，就是如果已经存在名字了，那么就直接返回，否则插入新用户
  existOrInsert(collectionName, key, insertItem, callback) {
    var collection = this.db.collection(collectionName);
    //使用async来同步操作，waterfall里面放函数数组。
    async.waterfall([
      function (callback) {
        collection.find(key).toArray((err, docs) => {
          assert.equal(err, null);
          console.log(docs);
          if (docs.length == 0) {
            callback(null, docs);
          }
          else {
            callback(1, docs);
          }
        });
      },
      function (docs, callback) {
        collection.insertOne(insertItem, (err, result) => {
          assert.equal(err, null);
          console.log(result.result.ok, result.insertedCount);
          callback(null, "done2");
        });
      }
    ], callback);
  }

  //for test

  deleteAll(collectionName, callback) {
    var collection = this.db.collection(collectionName);
    collection.deleteMany({}, callback);
  }
}

var dbops = new DBops();
module.exports = dbops;
