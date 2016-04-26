
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



//GET request

router.get(['/', '/:action'], function(req, res, next) {
	var action = req.params.action;

	console.log(req.ip);
	switch(action) {



	case "getSensors":
		
		console.log('inside get sensors switch case');
		

		var sensorsList=function(db,userdoc,callback){
			//var found=0;
			console.log(userdoc._id);
			//var cursor =db.collection('sensors').find({"dataSetId","station","location.lat","location.lng","features.sensorname","features.sensor"}).toArray(function(err,result){
				var cursor =db.collection('sensors').find().toArray(function(err,result){
				//var cursor =db.collection('sensors').find({ "dataSetId"},{_id:0,"uid":false}).toArray(function(err,result){
				console.log(result);
				//res.send(result);
				res.status(200).render("editor/sensorInstance.jade", {
					//workspaces: result,
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
		break;
	}
}); 	





//POST request
router.post(['/', '/:action'], function(req, res, next) {
	var action = req.params.action;

	switch(action){




	case "selectSensor":

		var jsondata, buffer = "", data,JSONParsed,stationName, latitude,longitude;


		/*console.log("Latitude is : "+req.body.latSelected);
		console.log("Longitude is : "+req.body.lngSelected);*/

		latitude=req.body.latSelected;
		longitude=req.body.lngSelected;

		console.log("Latitude is : "+latitude+"\n");
		console.log("Longitude is : "+longitude+"\n");



		//Get the station name from MongoDB based on Location of Map
		//db.collection('SensorData').distinct( "station", { latitude: 38.0657, longitude :-122.2302} );

		var getStationName = function(db, callback) {
			var found=0;
			console.log(req.sessionID);

			var cursor =db.collection('SensorData').distinct( "station", { latitude: 38.0657, longitude :-122.2302} ,function(err, doc) {
				assert.equal(err, null);
				if (doc != null) {
					console.log("Station Name is : "+ doc);


					// get Censoos Data
					var http = require("http");

					var ERDDAPurl, CencoosHead,CencoosStation,CencoosFormat,CencoosSensors,CencoosDateFrom,CencoosDateTo;

					CencoosHead="http://erddap.cencoos.org/erddap/tabledap/";
					CencoosStation="cencoos_carquinez";
					CencoosFormat=".csv";
					CencoosSensors="time,latitude,longitude,station,sea_water_pressure,mass_concentration_of_chlorophyll_in_sea_water,sea_water_temperature,sea_water_electrical_conductivity,mass_concentration_of_oxygen_in_sea_water_optical,mass_concentration_of_oxygen_in_sea_water,fractional_saturation_of_oxygen_in_sea_water_optical,fractional_saturation_of_oxygen_in_sea_water,sea_water_practical_salinity,sea_water_ph_reported_on_total_scale,turbidity,depth";

					CencoosDateFrom="2016-04-01T00:00:00Z";
					CencoosDateTo="2016-04-01T23:55:00Z";

					ERDDAPurl= CencoosHead+CencoosStation+CencoosFormat+"?"+CencoosSensors+"&time>="+CencoosDateFrom+"&time<="+CencoosDateTo;

					var request = http.get(ERDDAPurl, function (response) {


						response.on("data", function (chunk) {
							buffer += chunk;
						}); 

						response.on("end", function (err) {

							//console.log(buffer);

							var first = buffer.substring(0,buffer.indexOf("\n")+1);

							/*console.log("first:"+first);*/

							var second = buffer.substring(buffer.indexOf("\n")+1);
							/*console.log("\nsecond:"+second);*/

							var third = second.substring(second.indexOf("\n")+1);

							/*third = third.substring(third.indexOf("\n"));*/

							buffer=first+third;

							console.log("---------------JSON processing method	--------------------\n--------------------------------");


							var Converter = require("csvtojson").Converter;
							var converter = new Converter({});
							converter.fromString(buffer, function(err,jsondata){
								//your code here 

								//console.log(buffer);

								//Mongo Goes here
								console.log("MOngo insert begins");


								var insertData = function(db, callback) {

									db.collection('SensorData').insert(jsondata, function(err, doc) {
										//assert.equal(err, null);
										if (doc != null) {
											console.log(doc);

										} else {
											console.log("--------_ERROR--------");
										}
									});

								};

								MongoClient.connect(url, function (err, db) {
									if (err) {
										console.log('Unable to connect to the mongoDB server. Error:', err);
									} else {
										//HURRAY!! We are connected. :)
										console.log('Connection established to', url);

										// Stores the JSON data collected from API to MongoDB in collection "SensorData"

										insertData(db,function(){db.close();});

									}
								});

							});

						});

					});

				} else {
					//console.log("user not logged in");
					//res.redirect("/users/login");

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

				getStationName(db,function(){db.close();});

				insertMetrics(db,function(){db.close();});

			}
		});



		// Insert the usage(requestt09) by user
		var insertMetrics = function(db, callback) {
			console.log(req.sessionID);
			var cursor =db.collection('metrics').insert({ "sid":req.sessionID, "sensorName":"Oxygen in Water", "date": new Date()} ,function(err, doc) {
				//assert.equal(err, null);
				if (doc != null) {
					console.log(doc);

				} else {
					console.log("--------_ERROR--------");
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



			}
		});












		res.redirect("/editor/sensorInstance");
		res.end();

		break;
	}
});

module.exports = router;