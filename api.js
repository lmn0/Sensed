var r = require("./lib/request"),
    request = require("request")
    logger = require("./lib/logger");
var open = require("open");
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://tkris:password@ds039684.mlab.com:39684/mongo';
var assert = require('assert');


var Api = {
  login: function(req, res, cb) {

  var changeSession=function(doc,db, callback) {
   db.collection('users').updateOne(
      { "email" : req.body.email,"password":req.body.password },
      {
        $set: { "sid": req.sessionID }
      }, function(err, results) {
      console.log(results);
      
      if(doc.accountType == "admin")
        res.redirect('/admin/dashboard');
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
         changeSession(doc,db,function(){db.close();});
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