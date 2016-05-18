

// Node modules
var express = require('express'),
    async = require("async"),
    router = express.Router(),
    Api = require("../../api"),
    r = require("../../lib/request"),
    request=require("request");
var mongodb = require('mongodb');
var http = require('http');
var uuid=require('node-uuid');  
var fs = require('fs');
var io = require('socket.io')(8588);

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;
// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://tjs:password@ds013971.mlab.com:13971/sensed';
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

    case "retrieveMobileData":
      console.log("I'm here");
    break;

    case "mobileSensor":

    var getMobiles=function(db,userdoc,callback){
          var findMobile = function(db, callback) {
          var found=0;
    console.log(req.sessionID);
   var cursor =db.collection('mobileReg').find({"userid":""+userdoc._id}).toArray(function(err,result){
      assert.equal(err, null);
      if (result != null) {
        //console.log(doc);

           res.status(200).render("data/mobiles.jade", {
          data: result,
          pageTitle: "Sensed! - Dashboard",
          showRegister: true,
          showlogin:false
        });

         //actioncallback(db,result,function(){db.close();});
      } else {
        //console.log("user not logged in");
        res.status(200).render("data/mobiles.jade", {
          data: [],
          pageTitle: "Sensed! - Dashboard",
          showRegister: true,
          showlogin:false
        });
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
    
          findMobile(db,function(){db.close();});

        }
      });
    }
    checkSession(req,res,getMobiles);

    break;

    case "addphone":

    var sendQRCode=function(db,userdoc,callback){
      var str="mobilesensor"+"="+uuid.v4()+"="+userdoc._id;
      console.log(str);
       res.status(200).render("data/qrcode.jade", {
            data:str,
          pageTitle: "Sensed! - Dashboard",
          showRegister: true,
          showlogin:false
          });
    }
    checkSession(req,res,sendQRCode);
    break;
  }
});


//POST Req
router.post(['/', '/:action'], function(req, res, next) {
  var action = req.params.action;

  switch(action){

    case "mobileDataRetrieve":
    var flag=0;
    var getSensorData=function(db,userdoc){
      var cursor =db.collection('mobileReg').find({"userid":""+userdoc._id}).toArray(function(err,result){
        var userid="";
          var mobids=[];
          var i=0;
          console.log(typeof req.body.mobcheck)
        if(typeof req.body.mobcheck != typeof "string"){
          for(i=0;i<req.body.mobcheck.length;i++)
        {
          userid=req.body.mobcheck[i].split("+")[0];
          mobids.push(req.body.mobcheck[i].split("+")[1]);
        }
        }
         else
        {
            userid=req.body.mobcheck.split("+")[0];
          mobids.push(req.body.mobcheck.split("+")[1]);
        }


        //GET DATA FROM THE MONGODB to display in charts !

        var getTempData = function(socket, db, mobid) {
    console.log(userdoc._id+","+mobid+","+(new Date().getTime()));
    
   var cursor =db.collection('mobileAcce').find( { "mobid":mobid,"time":{$gte:new Date().getTime() - 10703}}).toArray(function(err,doc){
      assert.equal(err, null);
      console.log(doc);
      if (doc != null) {
        console.log(doc);
        socket.emit('data', doc);
      } else {
        console.log("Ending");
        res.send(404);
      }
      setTimeout(function(socket,db,mobid){
        getTempData(socket,db,mobid);
      }(socket,db,mobid), 3703);
      //res.redirect('dashboard');
   });

};

          MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
    var mobid=req.body.mobcheck.split("+")[1];
    console.log(">>>>>>>>>>>"+mobid);
    io.on('connection', function (socket) {
     // var loop=
       getTempData( socket,db,mobid);
     
      
    });
    // Get the documents collection
         res.status(200).render("data/mobileData.jade", {
          //data: doc,
         // nog:i,
          pageTitle: "Sensed! - Dashboard",
          showRegister: true,
          showlogin:false
        });
    
  }

      // assert.equal(err, null);
      // if (result != null) {
      //   //console.log(doc);

      //      res.status(200).render("data/mobiles.jade", {
      //     data: result,
      //     pageTitle: "Sensed! - Dashboard",
      //     showRegister: true,
      //     showlogin:false
      //   });

         //actioncallback(db,result,function(){db.close();});
      
      //res.redirect('dashboard');
   });

    });
    }
    checkSession(req,res,getSensorData);
    break;

    case "retrieve":

    //console.log(Object.keys(res.body).length)
    console.log()
    var findSubscription=function(db,userdoc,callback){
    var found=0;
        console.log("===="+userdoc._id);
        //var url[rq.body.check.length]=""; 
        console.log("->"+req.body.check);

        var tempSensor={};
        var tempFrom={};
        var tempTo={};
        var te="";
        //console.log(typeof req.body.check);
        if(typeof req.body.check != typeof "string"){
        for(i=0;i<req.body.check.length;i++)
        {
          if(te!=req.body.check[i].split("+")[0])
          {
            tempSensor[req.body.check[i].split("+")[0]]=[];
            tempFrom[req.body.check[i].split("+")[0]]=[];
            tempFrom[req.body.check[i].split("+")[0]]=req.body.check[i].split("+")[2];
            tempTo[req.body.check[i].split("+")[0]]=req.body.check[i].split("+")[3];
            te=req.body.check[i].split("+")[0];
          }
          tempSensor[req.body.check[i].split("+")[0]].push(req.body.check[i].split("+")[1])
          

          console.log(req.body.check[i].split("+")[0]);
        }}
        else
        {
         // console.log("<>"+req.body.check.split("+")[0]);
          if(te!=req.body.check.split("+")[0])
          {
            tempSensor[req.body.check.split("+")[0]]=[];
            tempFrom[req.body.check.split("+")[0]]=[];
            tempFrom[req.body.check.split("+")[0]]=req.body.check.split("+")[2];
            tempTo[req.body.check.split("+")[0]]=req.body.check.split("+")[3];
            te=req.body.check.split("+")[0];
          }
          tempSensor[req.body.check.split("+")[0]].push(req.body.check.split("+")[1])
          
        }

        //console.log("=><"+tempFrom[Object.keys(tempSensor)[i]]);

        //console.log(Object.keys(tempSensor).length);
        var count=0;
        var data=[];
        var nog=0;
        var dataCollected=function(jsonObj,numberofGraphs){
          console.log("???"+k+"???")
          //console.log(jsonObj)
          data.push(jsonObj);
          nog=nog+k;
          if(count==Object.keys(tempSensor).length)
          {
            //console.log(data);
          res.status(200).render("data/display.jade", {
            data:data,
            nog:nog,
          pageTitle: "Sensed! - Dashboard",
          showRegister: true,
          showlogin:false
          });
          }
        }
        var url=[];
      
        for(i=0;i<Object.keys(tempSensor).length;i++)
        {
          url.push("http://erddap.cencoos.org/erddap/tabledap/"+Object.keys(tempSensor)[i]+".json?time,station,"+tempSensor[Object.keys(tempSensor)[i]].join(",")+"&time>="+tempFrom[Object.keys(tempSensor)[i]]+"&time<="+tempTo[Object.keys(tempSensor)[i]]);
          console.log(url[i]);
          console.log("------->"+tempSensor[Object.keys(tempSensor)[i]].length+"<---");
          var row=tempSensor[Object.keys(tempSensor)[i]].length;
          request(url[i], function (error, response, body) {
            if (!error && response.statusCode == 200) {
              var rowlength = this.rowlength;
              console.log(Object.keys(tempSensor)[i]+"<><"+i+"><>"+rowlength);
              
              var jsonObj=JSON.parse(body);
              //jsonObj["dataSetId"]=""+Object.keys(tempSensor)[i];
              //data.push(jsonObj);
              //console.log(jsonObj);
              var modifiedJO={};
              modifiedJO["station"]=jsonObj.table.rows[0][1];
              modifiedJO["yname"]=[];
              modifiedJO["catego"]=[];
              modifiedJO["data"]=[];
              var dat={};
              var yname={};
              for(k=0;k<rowlength;k++){
                dat["data"+k]=[];
                yname[k]=jsonObj.table.columnNames[2+k]+"("+jsonObj.table.columnUnits[2+k]+")";
              }
              
              for(j=0;j<jsonObj.table.rows.length;j++)
              {
                modifiedJO["catego"].push(""+jsonObj.table.rows[j][0]);
                for(k=0;k<rowlength;k++)
                {
                  var key="data"+k;
                  dat[key].push(jsonObj.table.rows[j][2+k]);
                }
              }

              for(k=0;k<rowlength;k++)
              {
                var key="data"+k;
                modifiedJO["data"].push(dat[key]);
                modifiedJO["yname"].push(yname[k]);
              }

              //console.log(modifiedJO);
              count++;
              dataCollected(modifiedJO,k);
            }
          }.bind({rowlength:row}));

        }

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
    case "mobileMongoInsert":

    var addUser = function(db, callback) {
      console.log(JSON.stringify(req.body));
   var cursor =db.collection('mobileReg').insertOne( { "userid":req.body.userId,"mobid": req.body.mobId,"features":["Latitude & Longitude","Temperature","Pressure"],"device":req.body.device},function(err, result) {
      assert.equal(err, null);
      console.log(result);
      res.sendStatus(200);
   });
};

var findUser = function(db, callback) {
    console.log("USERID FROM MOB>>"+req.body.userId);
   var cursor =db.collection('users').findOne( { "_id": req.body.userId} ,function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
        console.log(doc);
         res.send(200,"loggedin");
         addUser(db,function(){db.close();})
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

    break;
  }
});

//====

module.exports = router;
