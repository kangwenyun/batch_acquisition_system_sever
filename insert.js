var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/Test',function(err, db){
    if(err){
        console.log('连接数据库错误!');
        console.log('错误信息：\n\t');
        console.log(err);
    }else{
        console.log('Success！！！');

db.collection("users", function (err,collection) {
             collection.findOne({'_id':"583fafd483cfef203cf5ba6b"}, function (err,docs) {
                 console.log(docs);
});

          
         });
  


}

})

