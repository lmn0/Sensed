
//Node modules
var express = require('express'),
async = require("async"),
router = express.Router(),
Api = require("../../api"),
r = require("../../lib/request"),
request=require("request");
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
//Connection URL. This is where your mongodb server is running.
var url = 'mongodb://tkris:password@ds039684.mlab.com:39684/mongo';
//var url = 'mongodb://localhost:27017/Sensed';
//var url = 'mongodb://ec2-54-187-12-155.us-west-2.compute.amazonaws.com:27017/Sensed';
//var url = 'mongodb://52.27.152.75:27017/Sensed';
//===
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
//			res.redirect('dashboard');
		});

	};

	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
//			HURRAY!! We are connected. :)
			console.log('Connection established to', url);

//			Get the documents collection

			findUser(db,function(){db.close();});

		}
	});
}

//GET request

router.get(['/', '/:action'], function(req, res, next) {
	var action = req.params.action;

	console.log(req.ip);
	switch(action) {



	case "loadRequestPage":

		console.log('inside request sensors switch case');

	
				res.status(200).render("editor/requestSensor.jade", {
					pageTitle: "Sensed! - Sensors",
					showRegister: true,
					showlogin:false

				});

		break;
	}
});





//POST request
router.post(['/', '/:action'], function(req, res, next) {
	var action = req.params.action;

	switch(action){


	case "addNewSensor":



		var requestSensor=function(db,userdoc,callback){

		console.log("===="+userdoc._id);

			var lng=req.body.lngSelected;
			var lat=req.body.latSelected;

			var sensor=req.body.sensorName;


			var userid=String(userdoc._id);

			console.log("lng"+lng);
			console.log("lat"+lat);

			
			db.collection('requestedSensors').insert( {userid: userid, sensorType: sensor, lng:lng, lat:lat,status : "Not Handeled"});
			db.close();
			
			

		

		res.status(200).redirect('/newSensor/loadRequestPage');
	}
		checkSession(req,res,requestSensor);

		break;
	}
});

module.exports = router;
