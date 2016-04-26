/*
  This module is used for handling authentication related actions
*/

// Node modules
var express = require('express'),
    async = require("async"),
    router = express.Router(),
    Api = require("../../api"),
    r = require("../../lib/request");
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://tjs:password@ds013971.mlab.com:13971/sensed';
//var url = 'mongodb://localhost:27017/Sensed';
//var url = 'mongodb://ec2-54-187-12-155.us-west-2.compute.amazonaws.com:27017/Sensed';
//var url = 'mongodb://52.27.152.75:27017/Sensed';


var assert = require('assert');
// ===

var Authentication = {
  login: function(req, res, r_type, cb) {
    switch(r_type) {
      case "PUT":
        Api.login(req, res, cb);
        break;

      default:
        res.status(400)
           .render("error", {
              pageTitle: "Sensed! - Error",
              errCode: 400,
              errMsg: "Invalid request"
            });
        break;
    }
  },
  createaccount: function(req, res, r_type, cb) {
    switch(r_type) {
      case "PUT":
        Api.createaccount(req, res, cb);
        break;

      default:
        res.status(400)
           .render("error", {
              pageTitle: "Sensed! - Error",
              errCode: 400,
              errMsg: "Invalid request"
            });
        break;
    }
  }
};

// GET requests
router.get(['/', '/:action'], function(req, res, next) {
  var action = req.params.action;
  switch(action) {
    case "register":
      res.status(200).render("authentication/login.jade", {
        pageTitle: "Sensed! - Login",
        showRegister: true,
        showlogin:true
      });
      break;
    case "notfound":
    res.status(200).render("authentication/notfound.jade", {
        pageTitle: "Sensed! - Login",
        showRegister: true,
        showlogin:true
      });
      break;
    case "createaccount":
    res.status(200).render("authentication/createaccount.jade", {
        pageTitle: "Sensed! - Login",
        showRegister: true,
        showlogin:true
      });
      break;
    case "alreadyexist":
    res.status(200).render("authentication/alreadyexist.jade", {
        pageTitle: "Sensed! - Login",
        showRegister: true,
        showlogin:true
      });
      break;
    case "logout":
      var changeSession=function(db, callback) {
   db.collection('users').updateOne(
      { "sid":req.sessionID },
      {
        $set: { "sid": "" }
      }, function(err, results) {
      console.log("results");
      res.status(200).render("authentication/login.jade", {
        pageTitle: "Sensed! - Login",
        showRegister: true,
        showlogin:true
      });
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
    changeSession(db,function(){db.close();});

  }
  
});
      break;
    default:
      res.status(200).render("authentication/login.jade", {
        pageTitle: "Sensed! - Login",
        showRegister: false,
        showlogin:true
      });
  }
});
// ====

// POST requests
router.post(['/', '/:action'], function(req, res, next) {
  var action = req.params.action;

  if(Authentication.hasOwnProperty(action)) {
    Authentication[action].call(this, req, res, "PUT",
    function(err, resp, body) {
        if(err) {
          res.status(500).json({"errors" : ["Internal Server error"]});
        } else {
          res.status(200).json(body);
        }
        next();
    });

  } else {
    res.status(404)
       .render("404.jade", {
          pageTitle: "Sensed!"
    });
    return next();
  }
});
// ====

module.exports = router;
