// Node Modules
var express = require("express"),
    bodyParser = require("body-parser"),
	morgan = require("morgan");
var session = require('express-session');
var cookieParser = require('cookie-parser');


// ===

// Lib
var Utilities = require("./lib/utilities.js");
// ===

var app = express();
app.use(cookieParser('my 114 o2o'));
app.use(session({
  maxAge : 1000*60*60*24 ,
  cookie : {
    maxAge : 1000*60*60*24 // expire the session(-cookie) after
  }
}));


var App = {
	config: require("./config.json"),
	build_type: "--dev",

	middlewares: function() {
		var t = this;

		/* Middlewares */
		app.use(function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Methods", ['GET','DELETE','PUT', 'POST']);
			res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
			return next();
		});

		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({
  			extended: true
		}));

		if(t.build_type=="--dev") {
			app.use(require("morgan")("dev"));
		}
		// ===
	},

	injectToTemplate: function(data) {
		// these variables will be available globally while rendering
		app.use(function(req, res, next) {
			res.locals = Utilities.mergeObjects(res.locals, data);
			return next();
		});
	},

	setupRoutes: function() {
		/* Application routes */
		app.use("/", require("./modules/pages/pages.js"));
		app.use("/users", require("./modules/authentication/authentication.js"));
    	app.use("/editor", require("./modules/editor/dashboard.js"));
    	app.use("/data", require("./modules/data/data.js"));
    	
		// ====
	},


	start: function(port) {
		app.listen(port, function()  {
			console.log('Listening on http://localhost:%d', port);
		});
	},

	init: function() {
		var t = this;

		if(process.argv.length == 3 || process.argv.length == 4) {
			t.build_type = process.argv[2];
		} else {
			console.log("Error: Incorrect number of arguments provided");
			console.log("Syntax: \n npm run prod");
			return;
		}

		switch(t.build_type) {
			case "--prod":
				t.config = t.config.production;
				break;

			case "--dev":
				t.config = t.config.development;
				break;

			default:
				console.log("Error: incorrect argument provided");
				return;
		}

		/* Global app configurations */
		app.locals.pretty = ((t.build_type == "--dev") && process.argv[3] != "--nopretty") ? true : false;
		app.locals.settings.env = (t.build_type == "--dev") ? "development" : "production";
		// ===

		/* Load middlewares */
		t.middlewares();
		// ====

		/* set view engine, path */
		app.set("views", "./views");
		app.set("view engine", "jade");
		// ====

		/* serve static files */
		app.use("/styles", express.static(__dirname + "/static/styles"));
		app.use("/images", express.static(__dirname + "/static/images"));
		app.use("/scripts", express.static(__dirname + "/static/scripts"));
		// ====

		t.injectToTemplate({
			staticURL: t.config.baseURL,
			env: app.locals.settings.env,
			config: t.config
		});

		t.setupRoutes();
		t.start(t.config.port);
	}
};


App.init();
module.exports = app;
