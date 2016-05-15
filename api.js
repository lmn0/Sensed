var r = require("./lib/request"),
    request = require("request")
    logger = require("./lib/logger");
var open = require("open");
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://tjs:password@ds013971.mlab.com:13971/sensed';
var assert = require('assert');


var Api = {
  login: function(req, res, cb) {

  var changeSession=function(db, callback) {
   db.collection('users').updateOne(
      { "email" : req.body.email,"password":req.body.password },
      {
        $set: { "sid": req.sessionID }
      }, function(err, results) {
      console.log(results);
      if(results.accountType == "admin")
        res.redirect('/admin/adminDas');
      else
       res.redirect('/editor/dashboard');
      res.end();
   });
};

  var findUser = function(db, callback) {
    console.log(req.body.email);
    console.log(req.body.password);
   var cursor =db.collection('users').findOne( { "email": req.body.email,"password":req.body.password} ,function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        console.log(doc);
         changeSession(db,function(){db.close();});
      } else {
        console.log(doc);
         res.redirect('notfound');
         res.end();
      }
      //res.redirect('dashboard');
   });
};
    
    //WRITE THE LOGIN LOGIC HERE !

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    // Get the documents collection
    findUser(db,function(){db.close();});

  }
  
});



// var postData={
//     ip:req.ip
// };
// request.post({
//     uri:"http://192.168.1.4:3002",
//     headers:{'content-type': 'application/x-www-form-urlencoded'},
//     body:require('querystring').stringify(postData)
//     },function(err,resp,body){
//         var jsonObject = JSON.parse(body);
//         console.log(jsonObject.Location);
//         setTimeout(function() {
//           var loc = jsonObject.Location.trim();
//           res.redirect(""+loc);
//           res.end();
//         }, 5000);   
// });


},

createaccount:function(req,res,cb){

    var addUser = function(db, callback) {
   var cursor =db.collection('users').insertOne( { "accountType":"user","email": req.body.email,"password":req.body.password,"sid":req.sessionID},function(err, result) {
      assert.equal(err, null);
      console.log(result);
      res.redirect('/editor/dashboard');
      res.end();
   });
};

var findUser = function(db, callback) {
    console.log(req.body.email);
   var cursor =db.collection('users').findOne( { "email": req.body.email} ,function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        console.log(doc);
         res.redirect('/users/alreadyexist');
         res.end();
      } else {
        console.log(doc);
        addUser(db,function(){db.close();})
      }
      //res.redirect('dashboard');
   });
};

  MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);

    // Get the documents collection
    findUser(db,function(){db.close();});
  }
  
});
}
}

module.exports = Api;