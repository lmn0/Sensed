
var express = require('express'),
    async = require("async"),
    router = express.Router(),
    Api = require("../../api"),
    r = require("../../lib/request"),
    request=require("request");
var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

var url ='mongodb://tjs:password@ds013971.mlab.com:13971/sensed';


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
          res.status(200).render("admin/dashboard.jade", {
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

   });
   
};
    MongoClient.connect(url, function (err, db) {
        if (err) {
          console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
          console.log('Connection established to', url);
          findUser(db,function(){db.close();});
        }
      });
      break;  
      
  case "requests":
	  var findUser = function(db, callback) {
	    var found=0;
	console.log(req.sessionID);
	var cursor =db.collection('requestedSensors').find({"status" :"Not Handeled"}).toArray(function(err, doc) {
	assert.equal(err, null);
	if (doc != null) {
	  res.status(200).render("admin/requests.jade", {
			data:doc,
			pageTitle: "Sensed! - Requests",
			showRegister: false,
			showlogin:false
		});
	  res.end();
	} else {
	  console.log("user not logged in");
	  res.redirect("/users/login");
	  res.end();
	}
	});
	};
	  MongoClient.connect(url, function (err, db) {
	  if (err) {
	    console.log('Unable to connect to the mongoDB server. Error:', err);
	  } else {
	    console.log('Connection established to', url);
	    findUser(db,function(){db.close();});
	    }
	});
	  break;
        
case "addAdmins": 					res.status(200).render("admin/addAdmins.jade", {
									pageTitle: "Sensed! - AddAdmins",
  						showRegister: false,
  						showlogin:false
        });
        break;
        
case "users": 
	   var findUser = function(db, callback) {
	          var found=0;
	    console.log(req.sessionID);
	   var cursor =db.collection('users').find().toArray(function(err, doc) {
	      assert.equal(err, null);
	      if (doc != null) {
	        res.status(200).render("admin/users.jade", {
				data:doc,
				pageTitle: "Sensed! - Requests",
				showRegister: false,
				showlogin:false
			});
	        res.end();
	      } else {
	        console.log("user not logged in");
	        res.redirect("/users/login");
	        res.end();
	      }
	   }); 
	};
	        MongoClient.connect(url, function (err, db) {
	        if (err) {
	          console.log('Unable to connect to the mongoDB server. Error:', err);
	        } else {
	          console.log('Connection established to', url);
	          findUser(db,function(){db.close();});
	        }
	      });			
      break;
      
case "addSensorsUserReq": 
	var findUser = function(db, callback) {
    var found=0;
console.log(req.sessionID);
var cursor =db.collection('requestedSensors').find({"present" :"No"}).toArray(function(err, doc) {
assert.equal(err, null);
if (doc != null) {
  res.status(200).render("admin/addSensors.jade", {
		data:doc,
		pageTitle: "Sensed! - Add Sensors",
		showRegister: false,
		showlogin:false
	});
  res.end();  
} else {
  console.log("user not logged in");
  res.redirect("/users/login");
  res.end();
}
});
};
  MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    findUser(db,function(){db.close();});
  }
});			
break;

case "addSensors": 
	var findUser = function(db, callback) {
    var found=0;
console.log(req.sessionID);
var cursor =db.collection('requestedSensors').find({"present" :"No"}).toArray(function(err, doc) {
assert.equal(err, null);
if (doc != null) {
  res.status(200).render("admin/addSensors.jade", {
		
		//send the data here like: 
		data:doc,
		pageTitle: "Sensed! - Add Sensors",
		showRegister: false,
		showlogin:false
	});
  res.end();
  
} else {
  console.log("user not logged in");
  //console.log("user not logged in");
  res.redirect("/users/login");
  res.end();
}
});
};
  MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
    findUser(db,function(){db.close();});  
  }
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
      res.render("admin/dashboard.jade", {
        pageTitle: "Sensed! - Dashboard",
        showRegister: false,
        showlogin:false
      });
  }
});

//POST requests
router.post(['/', '/:action'], function(req, res, next) {
  var action = req.params.action;
  switch (action){
  
  case "createaccount" : var email = req.body.email;
  						 var password = req.body.password;
  						 var Fname = req.body.FirstName;
  						 var Lname = req.body.LastName;
  						 var insertAdmin = function(db,callback) {
  							 db.collection('users').insert({"accountType" : "admin", "email" : email, "password" : password,
  								 "First_Name" : Fname, "Last_Name" : Lname},function(err, results) {
  	  						    	res.status(201).render("admin/ADS.jade", {
  	  									pageTitle: "Sensed! - Admin Added Successfully",
  	  									showRegister: false,
  	  									showlogin:false
  	  								});
  	  							  res.end();
  									
  	  						      callback();
  	  						   });
  	  						};
  	  						
  	  					MongoClient.connect(url, function(err, db) {
    						  assert.equal(null, err);

    						  insertAdmin(db, function() {
    						  });
    						});
    				  			break;

  
  case "SensorsAdded" : var requestIdsu = req.body.requestIdu;
  						console.log(requestIdsu);
  						var updateRestaurants = function(db, callback) {
  						   db.collection('requestedSensors').update(
  						      {"userId" : requestIdsu},
  						      {
  						        $set: { "status" : "Handeled" }
  						      }, function(err, results) {
  						    	res.redirect("/admin/Success.jade", {
  									pageTitle: "Sensed! - Sensors Added Successfully",
  									showRegister: false,
  									showlogin:false
  								});
  							  res.end();
  						      callback();
  						   });
  						};
  						
  						MongoClient.connect(url, function(err, db) {
  						  assert.equal(null, err);

  						  updateRestaurants(db, function() {
  						  });
  						});
  				  			break;
  				  			
  case "addSensors":
	  var requestIds = req.body.requestId;
	  var findUser = function(db, callback) {
	    var found=0;
	    console.log(req.sessionID);
	    var cursor =db.collection('requestedSensors').find({"userId" :requestIds}).toArray(function(err, doc) {
	    assert.equal(err, null);
	    if (doc != null) {
	      res.status(200).render("admin/addSensors.jade", {
	    	  data:doc,
	    		pageTitle: "Sensed! - Success",
	    		showRegister: false,
	    		showlogin:false
	    	});
	      res.end();
	      
	    } else {
	      console.log("user not logged in");
	      res.redirect("/users/login");
	      res.end();
	    }
	    });
	    };
	      MongoClient.connect(url, function (err, db) {
	      if (err) {
	        console.log('Unable to connect to the mongoDB server. Error:', err);
	      } else {
	        console.log('Connection established to', url);
	        findUser(db,function(){db.close();});  
	      }
	    });
	    	
	    break;
}});
module.exports = router;