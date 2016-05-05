
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
var url = 'mongodb://localhost:27017/Sensed';
//===
var assert = require('assert');



var rpi=[0,0];


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
					//findWorkspace(db,doc,function(){db.close();});
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

			}
		});
























		/*
		//Converter Class 
		var Converter = require("csvtojson").Converter;
		var converter = new Converter({constructResult:false}); //for big csv data
		var ERDDAPurl = "http://erddap.cencoos.org/erddap/tabledap/cencoos_carquinez.csv?time,latitude,longitude,station,sea_water_pressure,mass_concentration_of_chlorophyll_in_sea_water,sea_water_temperature,sea_water_electrical_conductivity,mass_concentration_of_oxygen_in_sea_water_optical,mass_concentration_of_oxygen_in_sea_water,fractional_saturation_of_oxygen_in_sea_water_optical,fractional_saturation_of_oxygen_in_sea_water,sea_water_practical_salinity,sea_water_ph_reported_on_total_scale,turbidity,depth&time%3E=2016-04-05T00:00:00Z&time%3C=2016-04-12T23:55:00Z";

		//record_parsed will be emitted each csv row being processed 
		converter.on("record_parsed", function (jsondata) {
		   console.log(jsondata); //here is your result json object 
		});

		require("request").get(ERDDAPurl).pipe(converter);

		 */

		// get Censoos Data
		var http = require("http");
		//ERDDAPurl = "http://erddap.cencoos.org/erddap/tabledap/cencoos_carquinez.json?time,latitude,longitude,station,sea_water_pressure,mass_concentration_of_chlorophyll_in_sea_water,sea_water_temperature,sea_water_electrical_conductivity,mass_concentration_of_oxygen_in_sea_water_optical,mass_concentration_of_oxygen_in_sea_water,fractional_saturation_of_oxygen_in_sea_water_optical,fractional_saturation_of_oxygen_in_sea_water,sea_water_practical_salinity,sea_water_ph_reported_on_total_scale,turbidity,depth&time%3E=2016-04-05T00:00:00Z&time%3C=2016-04-12T23:55:00Z";

		//ERDDAPurl = "http://erddap.cencoos.org/erddap/tabledap/cencoos_carquinez.csv?time,latitude,longitude,station,depth&time>=2016-04-05T00:00:00Z&time<=2016-04-12T23:55:00Z";
		var ERDDAPurl, CencoosHead,CencoosStation,CencoosFormat,CencoosSensors,CencoosDateFrom,CencoosDateTo;

		CencoosHead="http://erddap.cencoos.org/erddap/tabledap/";
		CencoosStation="cencoos_carquinez";
		CencoosFormat=".csv";
		//CencoosSensors="time,latitude,longitude,station,depth";
		CencoosSensors="time,latitude,longitude,station,sea_water_pressure,mass_concentration_of_chlorophyll_in_sea_water,sea_water_temperature,sea_water_electrical_conductivity,mass_concentration_of_oxygen_in_sea_water_optical,mass_concentration_of_oxygen_in_sea_water,fractional_saturation_of_oxygen_in_sea_water_optical,fractional_saturation_of_oxygen_in_sea_water,sea_water_practical_salinity,sea_water_ph_reported_on_total_scale,turbidity,depth";

		CencoosDateFrom="2016-04-01T00:00:00Z";
		CencoosDateTo="2016-04-01T23:55:00Z";

		ERDDAPurl= CencoosHead+CencoosStation+CencoosFormat+"?"+CencoosSensors+"&time>="+CencoosDateFrom+"&time<="+CencoosDateTo;

		//console.log(ERDDAPurl);

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

				// break the textblock into an array of lines

				//console.log("buffer.indexOf(\"\n\") = "+ buffer.indexOf("\n"));
				//console.log("buffer.indexOf(\"\n\") + 1 = "+ buffer.indexOf("\n") + 1);

				//buffer = buffer.substring(buffer.indexOf("\n") + 0);

				var first = buffer.substring(0,buffer.indexOf("\n")+1);

				//var bufferSUb=buffer.substring(buffer.indexOf("\n"));

				/*console.log("first:"+first);*/

				var second = buffer.substring(buffer.indexOf("\n")+1);
				/*console.log("\nsecond:"+second);*/

				var third = second.substring(second.indexOf("\n")+1);

				//third = third.substring(third.indexOf("\n"));

				buffer=first+third;

				/*console.log("\nthird"+third);*/

				/*buffer = second.substring(second.indexOf("\n"), second.indexOf("\n"));

				var second = buffer.substring(buffer.indexOf("\n") + 1);*/





				//console.log("\n FInal Buffer"+first+second);
				//console.log(first+second);

				//Different way to remove 2nd line
				/*
				var bufferArray = buffer.split('\n');
				// remove one line, starting at the first position

				bufferArray.splice(1,1);

//				console.log("lines.splice(1,1): "+lines);

				// join the array back into a single string
				var bufferWithoutLine2 = bufferArray.join('\n');
//				console.log("newtext=join:  "+bufferWithoutLine2);
				 */
				console.log("---------------JSON processing method	--------------------\n--------------------------------");


				var Converter = require("csvtojson").Converter;
				var converter = new Converter({});
				converter.fromString(buffer, function(err,jsondata){
					//your code here 

					//console.log(buffer);

					/*//Mongo Goes here
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

							// Stores the JSON data collected from API to MongoDB in collection "SensorData"

							insertData(db,function(){db.close();});

						}
					});*/

				});

			});

		});





		res.redirect("/editor/dashboard");
		res.end();

		break;
	}
});

module.exports = router;