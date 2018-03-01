/*
  This module is used for handling Editor related actions
*/

// Node modules
var express = require('express'),
    async = require("async"),
    router = express.Router(),
    Api = require("../../api"),
    r = require("../../lib/request"),
    request=require("request");
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://tkris:password@ds039684.mlab.com:39684/mongo';
// ===
var assert = require('assert');

var rpi=[0,0];

var checkSession =function(req,res,actioncallback){
          var findUser = function(db, callback) {
          var found=0;
    console.log(req.sessionID);
   var cursor =db.collection('users').findOne( { "sid":req.sessionID} ,function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        console.log(doc);
         actioncallback(db,doc,function(){db.close();});
      } else {
        console.log("user not logged in");
        res.redirect("/users/login");
        res.end();
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

//GET Req
router.get(['/', '/:action'], function(req, res, next) {
  var action = req.params.action;

  console.log(req.ip);
  switch(action) {
    case "dashboard":
  var wspaces=[];
     var findSubscription=function(db,userdoc,callback){

        var found=0;
        console.log("===="+userdoc._id);
        //console.log("->"+db);
        var cursor =db.collection('subscription').find({"userid":""+userdoc._id}).toArray(function(err,result){
          console.log("->" + JSON.stringify(result));
          if(err==null){
          res.status(200).render("editor/overview.jade", {
          subscription: result,
          pageTitle: "Sensed! - Dashboard",
          showRegister: true,
          showlogin:false
        });
        }
        else{
          res.status(200).render("404.jade");
          res.end();
        }
        //res.end();
        }); 
      } 

    checkSession(req,res,findSubscription);
      
      
      break;
      case "sensorInstance":

      break;
      case "billing":

          //Use mongoDB connection.. get all the sensor time and type of sensor for a particular user and display in table form!

          var findSubscription=function(db,userdoc,callback){

              var found=0;
              console.log("===="+userdoc._id);
              //console.log("->"+db);
              var cursor =db.collection('subscription').find({"userid":""+userdoc._id}).toArray(function(err,result){
                  console.log("->" + JSON.stringify(result));
                  if(result!=null){
                      res.status(200).render("editor/billing.jade", {
                          subscription: result,
                          pageTitle: "Sensed! - Dashboard",
                          showRegister: true,
                          showlogin:false
                      });
                  }
                  else
                  {
                      res.status(200).render("editor/billing.jade", {
                          subscription: [],
                          pageTitle: "Sensed! - Dashboard",
                          showRegister: true,
                          showlogin:false
                      });
                      //res.end();
                  }
                  //res.end();
              });

          }

          checkSession(req,res,findSubscription);
          break;

      case "map":


        var findSubscription=function(db,userdoc,callback){

        var found=0;
        //console.log("===="+userdoc._id);
        //console.log("->"+db);
        var cursor =db.collection('subscription').find({"userid":""+userdoc._id}).toArray(function(err,result){
          //console.log("->" + JSON.stringify(result[0]["subscribedto"]));
          res.status(200).render("editor/map.jade", {
            //subscription: result[0]["subscribedto"],
          subscription: result,
          pageTitle: "Sensed! - Dashboard",
          showRegister: true,
          showlogin:false
        });
        //res.end();
        }); 
      } 

    checkSession(req,res,findSubscription);
      

      break;
      
    case "overview":

 var findSubscription=function(db,userdoc,callback){

        var found=0;
        console.log("===="+userdoc._id);
        //console.log("->"+db);
        var cursor =db.collection('subscription').find({"userid":""+userdoc._id}).toArray(function(err,result){
          console.log("->" + JSON.stringify(result));
          if(result!=null){
          res.status(200).render("editor/overview.jade", {
          subscription: result,
          pageTitle: "Sensed! - Dashboard",
          showRegister: true,
          showlogin:false
        });
          }
        else
        {
          res.status(200).render("editor/overview.jade", {
          subscription: [],
          pageTitle: "Sensed! - Dashboard",
          showRegister: true,
          showlogin:false
        });
        //res.end();
        }
        //res.end();
        }); 
       
      } 

    checkSession(req,res,findSubscription);
      
      

      break;
    case "workspacepresent":
      res.status(200).render("editor/workspacepresent.jade", {
        pageTitle: "Sensed! - Dashboard",
        showRegister: true,
        showlogin:false
      });
      break;
    case "logout":
      res.status(200).render("authentication/alreadyexist.jade", {
        pageTitle: "Sensed! - Login",
        showRegister: true,
        showlogin:true
      });
      break;
    default:
      res.render("editor/dashboard.jade", {
        pageTitle: "Sensed! - Dashboard",
        showRegister: false,
        showlogin:false
      });
  }
});
// ===


//POST Req
router.post(['/', '/:action'], function(req, res, next) {
  var action = req.params.action;

  switch(action){
    case "userformsubmitaction":
    //MongoDB saving scene
    break;
    
  	case "run":
  		res.status(200).json({"status":"Executed"});
  		break;
  }
});
// ====

module.exports = router;