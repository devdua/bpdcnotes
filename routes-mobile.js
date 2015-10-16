/*
BITSNotes Routes
*/
/*Requirements*/
var passport = require('passport');
var db = require('./DBControl.js');
var nspace = require('express-namespace');
var fs = require('fs');

//Functions to check if user logged in
function isLoggedIn(req, res, next) {
   if(req.isAuthenticated()) return next();
   res.redirect('/login');
}

function isNotLoggedIn(req, res, next){
	if(!req.isAuthenticated()) return next();
   res.redirect('/');
}

//Function to if admin is logged in
function isAdminLoggedIn(req, res, next){
	//To check if admin logged in.
	next();
}

//Check if approved
function isApproved(req, res){
    if(req.user.isApproved === 0){
        return false;
    }

    else return true;
}


/*Exporting function*/
module.exports = function (app)
{
  app.post('/loginmob', isNotLoggedIn, function(req, res){
    passport.authenticate('local', function(err, user, info){
      if (err)
      {
          console.log(err);
          return next(err);
          res.set('content-type', 'application/json');
          res.send(500, JSON.stringify({"error": 1}));
          res.end();
      }
      if (!user)
      {
          return res.send(200);
      }
      req.login(user, function (err)
      {
          if (err)
          {
              console.log(err);
              return next(err);
          }
          return res.redirect('/');
      });
    })(req, res, next);
  });
}