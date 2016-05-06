
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



	case "getSensors":

		console.log('inside get sensors switch case');


		var sensorsList=function(db,userdoc,callback){
			console.log(userdoc._id);
			var cursor =db.collection('sensors').find().toArray(function(err,result){

				res.status(200).render("editor/sensorInstance.jade", {
					sensorsData: result,
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


	case "subscribeSensor":



		var findSubscription=function(db,userdoc,callback){
		var found=0;
		console.log("===="+userdoc._id);

		console.log("=========req.body.check==================");
		console.log(req.body.check);
		console.log("===========================");

		//console.log(req.body.dateFrom);
		//console.log(req.body.dateTo);

		//gov_noaa_nws_kmry+wind_speed+2016-01-06T00:00:00Z+2016-01-13T18:45:00Z
		//,
		//gov_noaa_nws_kmry+air_temperature+2016-01-06T00:00:00Z+2016-01-13T18:45:00Z
		//'gov_noaa_nws_kmry+wind_speed+Wind'

		var tempSensorStation="";
		var tempSensorDataSetID="";
		var tempSensorId="";
		var tempSensorName="";
		var tempSensorLat="";
		var tempSensorLng="";
		var userid="";
		var tempFrom=req.body.dateFrom;
		var tempTo=req.body.dateTo;
		var te="";

		console.log("Type of check is"+typeof(req.body.check));


		if(typeof req.body.check != typeof "string"){
			for(i=0;i<req.body.check.length;i++)
			{
				console.log("----------------------------------");
				console.log("----------------------------------");

				tempSensorDataSetID=req.body.check[i].split("+")[0];
				tempSensorLat=req.body.check[i].split("+")[1];
				tempSensorLng=req.body.check[i].split("+")[2];
				tempSensorId=req.body.check[i].split("+")[3];

				userid="571dc7758e70a5e6101dcac1";
				tempSensorStation="HARD CODED";
				tempSensorName="HARD CODED";

				console.log("Here comes the BOOOMMM");

				/*var sensorFromDB=db.collection('sensors').aggregate(
					    { $match : {
					     "features.sensor": tempSensorId,"dataSetId": tempSensorDataSetID
					  }},
					  { $unwind : "$features" },
					  { $match : {
					     "features.sensor": tempSensorId
					  }}
					);*/


				//console.log(sensorFromDB);




				/*var cursor =db.collection('sensors').distinct( "features.sensorname", {$and:[ {"dataSetId": tempSensorDataSetID},{"features.sensor":tempSensorId} ]}).toArray(function(err,result){
					console.log("->" + JSON.stringify(result));
					if(err==null){

					}
					else{

					}
				}
				);*/




					//tempSensorDataSetID="gov_noaa_nws_kmry";
					//tempSensorLat="36.5833333333333";
					//tempSensorLng="-121.85";

					//tempSensorName="Wind Speed (Knot)";
					//tempSensorId="wind_speed";

					//tempSensorName="Air Temperature (Degree F)";
					//tempSensorId="air_temperature";

					/*console.log("tempSensorStation: "+tempSensorStation);
					console.log("tempSensorDataSetID: "+tempSensorDataSetID);
					console.log("tempSensorLat: "+tempSensorLat);
					console.log("tempSensorLng: "+tempSensorLng);
					console.log("tempSensorId: "+tempSensorId);
					console.log("tempSensorName: "+tempSensorName);

					console.log("----------------------------------");
					console.log("----------------------------------");*/


					//var cursor =db.collection('subscription').find("station", { latitude: 38.0657, longitude :-122.2302}).toArray(function(err,result){
					//var dataSetId =db.collection('subscription').find("dataSetId",{"userid": "571dc7758e70a5e6101dcac1", "dataSetId": tempSensorDataSetID}).toArray(function(err,result){
					db.collection('subscription').distinct( "dataSetId", {"userid": userid, "dataSetId": tempSensorDataSetID} ,function(err, result) {


						if(err!=null)
						{
							console.log("There is some error from Database. Error is = "+err);
						}
						else
						{
							console.log("----------------------.....................");
							console.log("result:"+result);
							if(result==tempSensorDataSetID)
							{
								//DatasetID row already present.

								console.log(tempSensorDataSetID+" Already Present");

								//Check if the sensor exists, else insert a new sensor

								db.collection('subscription').distinct( "dataSetId", {"userid": userid, "dataSetId": tempSensorDataSetID,"subscribedto": {"sensorId":tempSensorId}} ,function(err1, result1) {

									console.log("result1 is :"+result1);

									if(err1!=null)
									{
										console.log("There is some error from Database. Error is = "+err1);
									}
									else
									{
										if(result1==tempSensorDataSetID)
										{
											//Sensor Name found
											//Do nothing

											console.log("Updating");

											db.collection('subscription').update(
													{"userid": userid, "dataSetId": tempSensorDataSetID},

													{$set:{
														from:tempFrom,to:tempTo
													}}
											);


//											db.collection('subscription').findAndModify({
//											query: {"userid": userid, "dataSetId": tempSensorDataSetID,"subscribedto": {"sensorId":tempSensorId}},
//											update:{$set: {from:tempFrom,to:tempTo,subscribedto:{sensorId:tempSensorId,sensorname:tempSensorName}}}
//											});

											console.log("Sensor Name found. The sensor name is: "+result1);
										}
										else
										{
											//Insert a new sensor in existing Station

											console.log("Insert sensor in existing hub ");

//											db.people.findAndModify({
//											query: { name: "Tom", state: "active", rating: { $gt: 10 } },
//											sort: { rating: 1 },
//											update: { $inc: { score: 1 } }
//											})

//											db.collection('subscription').find( {"userid": userid, "dataSetId": tempSensorDataSetID,"subscribedto": {"sensorId":tempSensorId}} ).update( { $set: { status: "I", points: "0" } } );


//											console.log("tempSensorStation: "+tempSensorStation);
//											console.log("tempSensorDataSetID: "+tempSensorDataSetID);
//											console.log("tempSensorLat: "+tempSensorLat);
//											console.log("tempSensorLng: "+tempSensorLng);
//											console.log("tempSensorId: "+tempSensorId);
//											console.log("tempSensorName: "+tempSensorName);
//
//											console.log("----------------------------------");
//											console.log("----------------------------------");


											db.collection('subscription').update(
													{"userid": userid, "dataSetId": tempSensorDataSetID},

													{$addToSet:{
														subscribedto:{sensorId:tempSensorId,sensorname:tempSensorName}
													}}
											);



										}
									}

								});

							}
							else
							{
								console.log(tempSensorDataSetID+" Not Present");
								//Insert everything -- NEW ROW

								console.log("-------------Insert everything -- NEW ROW---------------------");
								db.collection('subscription').insert( {userid: userid, dataSetId: tempSensorDataSetID, location: {lat:tempSensorLat,lng:tempSensorLng},from:tempFrom,to:tempTo,subscribedto:[{sensorId:tempSensorId,sensorname:tempSensorName}]});
							}

							/*{
							if(err==null)
								{
								console.log("Error while inserting a row for userid:"+userid+" tempSensorDataSetID: "+tempSensorDataSetID+""+);

								}
								});*/

						}
					});
				}
			}
			else
			{
				console.log("----------------------------------");
				console.log("----------------------------------");


				tempSensorDataSetID=req.body.check.split("+")[0];
				tempSensorLat=req.body.check.split("+")[1];
				tempSensorLng=req.body.check.split("+")[2];
				tempSensorId=req.body.check.split("+")[3];





				userid="571dc7758e70a5e6101dcac1";
				tempSensorStation="HARD CODED";
				tempSensorName="HARD CODED";

				//tempSensorDataSetID="gov_noaa_nws_kmry";
				//tempSensorLat="36.5833333333333";
				//tempSensorLng="-121.85";

				//tempSensorName="Wind Speed (Knot)";
				//tempSensorId="wind_speed";

				//tempSensorName="Air Temperature (Degree F)";
				//tempSensorId="air_temperature";

				console.log("tempSensorStation: "+tempSensorStation);
				console.log("tempSensorDataSetID: "+tempSensorDataSetID);
				console.log("tempSensorLat: "+tempSensorLat);
				console.log("tempSensorLng: "+tempSensorLng);
				console.log("tempSensorId: "+tempSensorId);
				console.log("tempSensorName: "+tempSensorName);

				console.log("----------------------------------");
				console.log("----------------------------------");


				//var cursor =db.collection('subscription').find("station", { latitude: 38.0657, longitude :-122.2302}).toArray(function(err,result){
				//var dataSetId =db.collection('subscription').find("dataSetId",{"userid": "571dc7758e70a5e6101dcac1", "dataSetId": tempSensorDataSetID}).toArray(function(err,result){
				db.collection('subscription').distinct( "dataSetId", {"userid": userid, "dataSetId": tempSensorDataSetID} ,function(err, result) {


					if(err!=null)
					{
						console.log("There is some error from Database. Error is = "+err);
					}
					else
					{
						console.log("----------------------.....................");
						console.log("result:"+result);
						if(result==tempSensorDataSetID)
						{
							//DatasetID row already present.

							console.log(tempSensorDataSetID+" Already Present");

							//Check if the sensor exists, else insert a new sensor

							db.collection('subscription').distinct( "dataSetId", {"userid": userid, "dataSetId": tempSensorDataSetID,"subscribedto": {"sensorId":tempSensorId}} ,function(err1, result1) {

								console.log("result1 is :"+result1);

								if(err1!=null)
								{
									console.log("There is some error from Database. Error is = "+err1);
								}
								else
								{
									if(result1==tempSensorDataSetID)
									{
										//Sensor Name found
										//Do nothing

										console.log("Updating");

										db.collection('subscription').update(
												{"userid": userid, "dataSetId": tempSensorDataSetID},

												{$set:{
													from:tempFrom,to:tempTo
												}}
										);


//										db.collection('subscription').findAndModify({
//										query: {"userid": userid, "dataSetId": tempSensorDataSetID,"subscribedto": {"sensorId":tempSensorId}},
//										update:{$set: {from:tempFrom,to:tempTo,subscribedto:{sensorId:tempSensorId,sensorname:tempSensorName}}}
//										});

										console.log("Sensor Name found. The sensor name is: "+result1);
									}
									else
									{
										//Insert a new sensor in existing Station

										console.log("Insert sensor in existing hub ");

//										db.people.findAndModify({
//										query: { name: "Tom", state: "active", rating: { $gt: 10 } },
//										sort: { rating: 1 },
//										update: { $inc: { score: 1 } }
//										})

//										db.collection('subscription').find( {"userid": userid, "dataSetId": tempSensorDataSetID,"subscribedto": {"sensorId":tempSensorId}} ).update( { $set: { status: "I", points: "0" } } );

										db.collection('subscription').update(
												{"userid": userid, "dataSetId": tempSensorDataSetID},

												{$push:{
													subscribedto:{sensorId:tempSensorId,sensorname:tempSensorName}
												}}
										);



									}
								}

							});

						}
						else
						{
							console.log(tempSensorDataSetID+" Not Present");
							//Insert everything -- NEW ROW

							console.log("-------------Insert everything -- NEW ROW---------------------");
							db.collection('subscription').insert( {userid: userid, dataSetId: tempSensorDataSetID, location: {lat:tempSensorLat,lng:tempSensorLng},from:tempFrom,to:tempTo,subscribedto:{sensorId:tempSensorId,sensorname:tempSensorName}});
						}

						/*{
						if(err==null)
							{
							console.log("Error while inserting a row for userid:"+userid+" tempSensorDataSetID: "+tempSensorDataSetID+""+);

							}
							});*/

					}
				});

			}



			res.status(200).redirect('/sensor/getSensors');
			/*res.status(200).render("editor/sensorInstance.jade", {
			res.('/nodepost.js?a=1

			pageTitle: "Sensed! - Dashboard",
			showRegister: true,
			showlogin:false
		});*/


			// var cursor =db.collection('subscription').find({"userid":""+userdoc._id}).toArray(function(err,result){
			//   //console.log("->" + JSON.stringify(result));
			//   if(err==null){
			//   res.status(200).render("data/display.jade", {
			//   subscription: result,
			//   pageTitle: "Sensed! - Dashboard",
			//   showRegister: true,
			//   showlogin:false
			// });

			// }
			// else{
			//   res.status(200).render("404.jade");
			//   res.end();
			// }
			// db.close();
			// //res.end();
			// });
		}

		checkSession(req,res,findSubscription);

		break;


	}
	});

				module.exports = router;
