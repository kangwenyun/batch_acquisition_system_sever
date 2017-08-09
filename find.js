var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/MongoTest', function (err, db) {
    if (err) {
        console.log('连接数据库错误!');
        console.log('错误信息：\n\t');
        console.log(err);
    } else {
        console.log('Success！！！');

        db.collection("UserInfo", function (err, collection) {
            collection.update({ userid: 'test' }, { $set: { passwd: 123 } }, function (err, result) {
                if (err) {
                    console.log('Error:' + err);
                    return;
                }
                else {
                    console.log(result)
                }
            })
        });
    }
});


