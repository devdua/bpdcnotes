/*
App.js for BITSNotes
*/ 
/*Requirements*/
var http = require('http');
var express = require('express');
var nspace = require('express-namespace');
var passport = require('passport');
var mongoStore = require('connect-mongodb');
var DBControl = require('./DBControl.js');
var routes = require('./routes.js');
var mobRoutes = require('./routes-mobile.js');

/*Variables*/
var dbConnectionURL = 'mongodb://bitsnotes:B1t5N0t35Db@ds027748.mongolab.com:27748/bitnotesdb';

/*Express Initialisation*/
var app = express();

/*settings*/
app.configure(function(){
	app.set('title', 'BPDC Notes')
	app.set('port', (process.env.PORT || 2014));
	app.set('view engine', 'jade');
	app.set('views', './views');
	/*app.use(s)*/
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.session({secret: 'OrangeKetchup!@#$4321'}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
	app.use(express.static('./public'));
	app.use(express.errorHandler());
	app.use(express.favicon());
});

app.use(function(req, res, next){
  res.status(404);
  res.render('404', { url: req.url });
  return;
});
app.locals.pretty = true;

/*Connect to DB*/
DBControl.connectDB(dbConnectionURL, function(returnStr){
	console.log(returnStr);
});

/*Contorl Routes*/
routes(app);
mobRoutes(app);

/*Create Server*/
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
