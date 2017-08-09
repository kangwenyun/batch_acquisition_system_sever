var MongoClient = require('mongodb').MongoClient;
var docs=[
    {type:"food",price:11},
    {type:"food",price:10},
    {type:"food",price:9},
    {type:"food",price:8},
    {type:"book",price:9}
];
MongoClient.connect('mongodb://localhost:27017/Test',function(err, db){
    if(err){
        console.log('连接数据库错误!');
        console.log('错误信息：\n\t');
        console.log(err);
    }else{
        console.log('Success！！！');

db.collection("userss", function (err,collection) {
             collection.insert(docs, function (err,docs) {
                 console.log(docs);
                 db.close();
             });
            
         });        


}

})

