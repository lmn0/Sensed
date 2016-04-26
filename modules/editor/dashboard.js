/*
  This module is used for handling Editor related actions
 */

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
var url = 'mongodb://tjs:password@ds013971.mlab.com:13971/sensed';
//var url = 'mongodb://localhost:27017/Sensed';
//var url = 'mongodb://ec2-54-187-12-155.us-west-2.compute.amazonaws.com:27017/Sensed';
//var url = 'mongodb://52.27.152.75:27017/Sensed';

//===
var assert = require('assert');

var rpi=[0,0];

//GET Req
router.get(['/', '/:action'], function(req, res, next) {
	var action = req.params.action;

	console.log(req.ip);
	switch(action) {
	case "dashboard":
		var wspaces=[];
		var findWorkspaces=function(db,userdoc,callback){
			var found=0;
			console.log(userdoc._id);
			var cursor =db.collection('workspace').find({ "uid":userdoc._id},{_id:0,"uid":false}).toArray(function(err,result){
				console.log(result);
				res.status(200).render("editor/dashboard.jade", {
					workspaces: result,
					pageTitle: "Sensed! - Dashboard",
					showRegister: true,
					showlogin:false
				});
			}); 
		} 


		var findUser = function(db, callback) {
			var found=0;
			console.log(req.sessionID);
			var cursor =db.collection('users').findOne( { "sid":req.sessionID} ,function(err, doc) {
				assert.equal(err, null);
				if (doc != null) {
					console.log(doc);
					findWorkspaces(db,doc,function(){db.close();});
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


		break;
	case "overview":
		res.status(200).render("editor/overview.jade", {
			pageTitle: "Sensed! - Dashboard",
			showRegister: true,
			showlogin:false
		});
		break;
	case "workspacepresent":
		res.status(200).render("editor/workspacepresent.jade", {
			pageTitle: "Sensed! - Dashboard",
			showRegister: true,
			showlogin:false
		});
		break;

	case "sensorInstance":

		console.log('Inside Sensor Instance Page');
		
		var sensorsList=function(db,userdoc,callback){
			//var found=0;
			console.log(userdoc._id);
			//var cursor =db.collection('sensors').find({"dataSetId","station","location.lat","location.lng","features.sensorname","features.sensor"}).toArray(function(err,result){
				var cursor =db.collection('sensors').find().toArray(function(err,result){
				//var cursor =db.collection('sensors').find({ "dataSetId"},{_id:0,"uid":false}).toArray(function(err,result){
				console.log(result);
				
				res.status(200).render("editor/sensorInstance.jade", {
					SensorsData: result,
					pageTitle: "Sensed! - Sensors",
					showRegister: true,
					showlogin:false
					
				});
				
			}); 
		}
		
		MongoClient.connect(url, function (err, db) {
			if (err) {
				console.log('Unable to connect to the mongoDB server. Error:', err);
			} else {
				//HURRAY!! We are connected. :)
				console.log('Connection established to', url);

				// Get the documents collection

				sensorsList(db,function(){db.close();});

			}
		});
		
		
		/*var jsondata, buffer = "", data,JSONParsed;
		
		
		//Converter Class 
		var Converter = require("csvtojson").Converter;
		var converter = new Converter({constructResult:false}); //for big csv data
		var ERDDAPurl = "http://erddap.cencoos.org/erddap/tabledap/cencoos_carquinez.csv?time,latitude,longitude,station,sea_water_pressure,mass_concentration_of_chlorophyll_in_sea_water,sea_water_temperature,sea_water_electrical_conductivity,mass_concentration_of_oxygen_in_sea_water_optical,mass_concentration_of_oxygen_in_sea_water,fractional_saturation_of_oxygen_in_sea_water_optical,fractional_saturation_of_oxygen_in_sea_water,sea_water_practical_salinity,sea_water_ph_reported_on_total_scale,turbidity,depth&time%3E=2016-04-05T00:00:00Z&time%3C=2016-04-12T23:55:00Z";
		 
		//record_parsed will be emitted each csv row being processed 
		converter.on("record_parsed", function (jsondata) {
		   console.log(jsondata); //here is your result json object 
		});
		 
		require("request").get(ERDDAPurl).pipe(converter);
		
		
		

		
		
		// get Censoos Data
		var http = require("http");
		//ERDDAPurl = "http://erddap.cencoos.org/erddap/tabledap/cencoos_carquinez.json?time,latitude,longitude,station,sea_water_pressure,mass_concentration_of_chlorophyll_in_sea_water,sea_water_temperature,sea_water_electrical_conductivity,mass_concentration_of_oxygen_in_sea_water_optical,mass_concentration_of_oxygen_in_sea_water,fractional_saturation_of_oxygen_in_sea_water_optical,fractional_saturation_of_oxygen_in_sea_water,sea_water_practical_salinity,sea_water_ph_reported_on_total_scale,turbidity,depth&time%3E=2016-04-05T00:00:00Z&time%3C=2016-04-12T23:55:00Z";
		ERDDAPurl = "http://erddap.cencoos.org/erddap/tabledap/cencoos_carquinez.csv?time,latitude,longitude,station,depth&time>=2016-04-05T00:00:00Z&time<=2016-04-12T23:55:00Z";
		
		
		
		// get is a simple wrapper for request()
		// which sets the http method to GET
		var request = http.get(ERDDAPurl, function (response) {
			// data is streamed in chunks from the server
			// so we have to handle the "data" event    
		

		
		response.on("data", function (chunk) {
			buffer += chunk;
		}); 

		response.on("end", function (err) {
			// finished transferring data
			// dump the raw data
			//console.log(buffer);
			console.log("---------------ads--------------------\n--------------------------------");
			//jsondata = JSON.parse(buffer);
			
			var Converter = require("csvtojson").Converter;
			var converter = new Converter({});
			converter.fromString(buffer, function(err,jsondata){
			  //your code here 
				
				//Mongo Goes here
				console.log("MOngo insert begins");


				var insertData = function(db, callback) {
					//var found=0;
					//console.log(req.sessionID);
					//var cursor =db.collection('users').findOne( { "sid":req.sessionID} ,function(err, doc) {
					//db.collection('test').insert({ test : "NarasaKumar1"}, function(err, doc) {
					db.collection('SensorData').insert(jsondata, function(err, doc) {
						//assert.equal(err, null);
						if (doc != null) {
							console.log(doc);
							//findWorkspaces(db,doc,function(){db.close();});
						} else {
							console.log("--------_ERROR--------");
							//res.redirect("/users/login");
							//res.end();
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

						insertData(db,function(){db.close();});

					}
				});
				
			});
			
			//console.log(jsondata);
			
			JSONParsed = JSON.parse(jsondata);
			console.log(JSONParsed);
			//JSONParsed=buffer.pipe(converter);
			
			
			//console.log("typeof jsondata:  "+typeof jsondata);
			
			
			

		});

		});*/
		
		
		


		/*res.status(200).render("editor/sensorInstance.jade", {
			pageTitle: "Sensed! - Sensor Data Collection",
			showRegister: true,
			showlogin:false,
			UserName: "Narasa Kumar"

		});*/



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
//===


//POST Req
router.post(['/', '/:action'], function(req, res, next) {
	var action = req.params.action;

	switch(action){
	case "newworkspace":

		console.log(req.body.butt);

		if(req.body.butt != "create")
		{
			var inp = (req.body.butt).split("+");
			console.log("------------------------------------")
			console.log(inp[1]);
			if(inp[0] == "1"){

				var startcontainer = function(db,rpiurl,userdoc,callback){
					//get the container ID

					//Call kubernetes and start the container
					var postData={
							ip:req.ip
					};
					request.post({
						uri:rpiurl,
						headers:{'content-type': 'application/x-www-form-urlencoded'},
						body:require('querystring').stringify(postData)
					},function(err,resp,body){
						if(!err){
							var jsonObject = JSON.parse(body);
							console.log(jsonObject);
							db.collection('workspace').updateOne({ "uid":userdoc._id,"workspace":inp[1]}, { $set: { "running": true ,"conid":(jsonObject.ConID).trim()}} ,function(err, doc) {
								assert.equal(err, null);
								if (doc != null) {
									console.log(doc);
									//if(doc.status=)
									//startcontainer(db,doc,function(){db.close();});
									setTimeout(function() {
										var loc = jsonObject.Location.trim();
										res.redirect(""+loc);
										res.end();
									}, 5000);

								} else {
									console.log(doc);
									res.redirect("/users/login");
								}
							}); 

						}
					});
				}

				var resumecontainer = function(db,rpiurl,userdoc,wsdoc,callback){
					//get the container ID

					//Call kubernetes and start the container
					var postData={
							ip:req.ip,
							cid:wsdoc.conid
					};
					request.post({
						uri:rpiurl,
						headers:{'content-type': 'application/x-www-form-urlencoded'},
						body:require('querystring').stringify(postData)
					},function(err,resp,body){
						if(!err){
							var jsonObject = JSON.parse(body);
							console.log(jsonObject);
							db.collection('workspace').updateOne({ "uid":userdoc._id,"workspace":inp[1]}, { $set: { "running": true }} ,function(err, doc) {
								assert.equal(err, null);
								if (doc != null) {
									//console.log(doc);
									//if(doc.status=)
									//startcontainer(db,doc,function(){db.close();});
									setTimeout(function() {
										var loc = jsonObject.Location.trim();
										res.redirect(""+loc);
										res.end();
									}, 5000);

								} else {
									console.log(doc);
									res.redirect("/editor/dashboard");
								}
							}); 

						}
					});
				}

				var findWorkspace=function(db,userdoc,callback){
					var found=0;
					var rpiurl="";
					console.log(userdoc._id);
					var cursor =db.collection('workspace').findOne({ "uid":userdoc._id,"workspace":inp[1],"running":false},function(err, doc) {
						assert.equal(err, null);
						if (doc != null) {
							console.log(doc);
							//if(doc.status=)
							if(doc.conid==""){
								if(doc.storedon==1)
									rpiurl="http://192.168.10.4:3002/"
										else
											rpiurl="http://192.168.10.102:3002/"
												startcontainer(db,rpiurl,userdoc,function(){db.close();});
							}
							else{
								if(doc.storedon==1)
									rpiurl="http://192.168.10.4:3002/resume"
										else
											rpiurl="http://192.168.10.102:3002/resume"
												resumecontainer(db,rpiurl,userdoc,doc,function(){db.close();});
							}

						} else {
							console.log(doc);
							res.redirect("/editor/dashboard");
						}
					}); 
				} 

				var findUser = function(db, callback) {
					var found=0;
					console.log(req.sessionID);
					var cursor =db.collection('users').findOne( { "sid":req.sessionID} ,function(err, doc) {
						assert.equal(err, null);
						if (doc != null) {
							console.log(doc);
							findWorkspace(db,doc,function(){db.close();});
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
			else if(inp[0] == "2"){

				var stopcontainer = function(db,rpiurl,userdoc,wsdoc,callback){
					//get the container ID

					//Call kubernetes and start the container
					var postData={
							cid:wsdoc.conid
					};
					request.post({
						uri:rpiurl,
						headers:{'content-type': 'application/x-www-form-urlencoded'},
						body:require('querystring').stringify(postData)
					},function(err,resp,body){
						if(!err){
							var jsonObject = JSON.parse(body);
							console.log(jsonObject);
							if(jsonObject.status=="stopped")
								db.collection('workspace').updateOne({ "uid":userdoc._id,"workspace":inp[1]}, { $set: { "running": false}} ,function(err, doc) {
									assert.equal(err, null);
									if (doc != null) {
										console.log(doc);
										//if(doc.status=)
										//startcontainer(db,doc,function(){db.close();});

										res.redirect('/editor/dashboard');
										res.end();

									} else {
										console.log(doc);
										res.redirect("/editor/dashboard");
									}
								}); 

						}
					});
				}

				var findWorkspace=function(db,userdoc,callback){
					var found=0;
					var rpiurl="";
					console.log(userdoc._id);
					var cursor =db.collection('workspace').findOne({ "uid":userdoc._id,"workspace":inp[1],"running":true},function(err, doc) {
						assert.equal(err, null);
						if (doc != null) {
							console.log(doc);
							//if(doc.status=)

							if(doc.storedon==1)
								rpiurl ="http://192.168.10.4:3002/stop"
									else
										rpiurl="http://192.168.10.102:3002/stop"

											stopcontainer(db,rpiurl,userdoc,doc,function(){db.close();});


						} else {
							console.log(doc);
							res.redirect("/editor/dashboard");
						}
					}); 
				} 

				var findUser = function(db, callback) {
					var found=0;
					console.log(req.sessionID);
					var cursor =db.collection('users').findOne({ "sid":req.sessionID} ,function(err, doc) {
						assert.equal(err, null);
						if (doc != null) {
							console.log(doc);
							findWorkspace(db,doc,function(){db.close();});
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
			else if(inp[0] == "3"){


				var deletecontainer = function(db,rpiurl,userdoc,wsdoc,callback){
					//get the container ID

					//Call kubernetes and start the container
					var postData={
							cid:wsdoc.conid
					};
					request.post({
						uri:rpiurl,
						headers:{'content-type': 'application/x-www-form-urlencoded'},
						body:require('querystring').stringify(postData)
					},function(err,resp,body){
						if(!err){
							var jsonObject = JSON.parse(body);
							console.log(jsonObject);
							if(jsonObject.status=="deleted")
								db.collection('workspace').deleteOne({ "uid":userdoc._id,"workspace":inp[1]},function(err, doc) {
									assert.equal(err, null);
									if (doc != null) {
										//console.log(doc);
										//if(doc.status=)
										//startcontainer(db,doc,function(){db.close();});

										res.redirect('/editor/dashboard');
										res.end();

									} else {
										console.log(doc);
										res.redirect("/editor/dashboard");
									}
								}); 

						}
					});
				}

				var findWorkspace=function(db,userdoc,callback){
					var found=0;
					var rpiurl="";
					console.log(userdoc._id);
					var cursor =db.collection('workspace').findOne({ "uid":userdoc._id,"workspace":inp[1],"running":true},function(err, doc) {
						assert.equal(err, null);
						if (doc != null) {
							console.log(doc);
							//if(doc.status=)
							if(doc.storedon==1)
								rpiurl ="http://192.168.10.4:3002/delete"
									else
										rpiurl="http://192.168.10.102:3002/delete"
											deletecontainer(db,rpiurl,userdoc,doc,function(){db.close();});


						} else {
							console.log(doc);
							res.redirect("/editor/dashboard");
						}
					}); 
				} 

				var findUser = function(db, callback) {
					var found=0;
					console.log(req.sessionID);
					var cursor =db.collection('users').findOne( { "sid":req.sessionID} ,function(err, doc) {
						assert.equal(err, null);
						if (doc != null) {
							console.log(doc);
							findWorkspace(db,doc,function(){db.close();});
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

			}else if(inp[0] == "4"){
				var opencontainer = function(db,rpiurl,userdoc,wsdoc,callback){
					//get the container ID

					//Call kubernetes and start the container
					var postData={
							ip:req.ip,
							cid:wsdoc.conid
					};
					request.post({
						uri:rpiurl,
						headers:{'content-type': 'application/x-www-form-urlencoded'},
						body:require('querystring').stringify(postData)
					},function(err,resp,body){
						if(!err){
							var jsonObject = JSON.parse(body);
							console.log(jsonObject);
							db.collection('workspace').updateOne({ "uid":userdoc._id,"workspace":inp[1]}, { $set: { "running": true }} ,function(err, doc) {
								assert.equal(err, null);
								if (doc != null) {
									//console.log(doc);
									//if(doc.status=)
									//startcontainer(db,doc,function(){db.close();});
									setTimeout(function() {
										var loc = jsonObject.Location.trim();
										res.redirect(""+loc);
										res.end();
									}, 5000);

								} else {
									console.log(doc);
									res.redirect("/editor/dashboard");
								}
							}); 

						}
					});
				}

				var findWorkspace=function(db,userdoc,callback){
					var found=0;
					var rpiurl="";
					console.log(userdoc._id);
					var cursor =db.collection('workspace').findOne({ "uid":userdoc._id,"workspace":inp[1],"running":true},function(err, doc) {
						assert.equal(err, null);
						if (doc != null) {
							console.log(doc);
							//if(doc.status=)

							if(doc.storedon==1)
								rpiurl="http://192.168.10.4:3002/open"
									else
										rpiurl="http://192.168.10.102:3002/open"
											opencontainer(db,rpiurl,userdoc,doc,function(){db.close();});
						} else {
							console.log(doc);
							res.redirect("/editor/dashboard");
						}
					}); 
				} 

				var findUser = function(db, callback) {
					var found=0;
					console.log(req.sessionID);
					var cursor =db.collection('users').findOne( { "sid":req.sessionID} ,function(err, doc) {
						assert.equal(err, null);
						if (doc != null) {
							console.log(doc);
							findWorkspace(db,doc,function(){db.close();});
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


		}else if(req.body.workspacename=="" || req.body.descrip=="")
		{
			res.redirect("/editor/dashboard");
			res.end();
		}else{
			var addWorkspace=function(db,user,callback){
				var storedon = 0;
				if(rpi[0]<=rpi[1]){
					storedon=1;rpi[0]=rpi[0]+1;}
				else{
					storedon=2;rpi[1]=rpi[1]+1;}

				var cursor =db.collection('workspace').insertOne( { "uid": user._id,"workspace":req.body.workspacename,"description":req.body.descrip,"running":false,"conid":"","storedon":storedon},function(err, result) {
					assert.equal(err, null);
					res.redirect('/editor/dashboard');
					res.end();
				});
			}

			var findWorkspace=function(db,userdoc,callback){
				var found=0;
				console.log(userdoc._id);
				var cursor =db.collection('workspace').findOne({ "uid":userdoc._id,"workspace":req.body.workspacename},function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						console.log(doc);
						res.redirect("/editor/dashboard");
					} else {
						console.log(doc);
						addWorkspace(db,userdoc,function(){db.close();});
					}
				}); 
			} 
			//res.redirect('dashboard');


			var findUser = function(db, callback) {
				var found=0;
				console.log(req.sessionID);
				var cursor =db.collection('users').findOne( { "sid":req.sessionID} ,function(err, doc) {
					assert.equal(err, null);
					if (doc != null) {
						console.log(doc);
						findWorkspace(db,doc,function(){db.close();});
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
			});}

		break;

	case "run":
		res.status(200).json({"status":"Executed"});
		break;
	}
});
//====

module.exports = router;
