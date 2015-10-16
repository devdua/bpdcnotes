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
    // Render '/'
    app.get('/', function (req, res)
    {
        if (req.isAuthenticated() && isApproved(req, res)){
            if(req.user.role === "user"){ 
                res.render('index', { userIn: true });   
            }
            else if(req.user.role === "admin"){
                res.render('admin-index');
            }
        }

        else if(req.isAuthenticated() && !isApproved(req, res)){
            res.render('noapprove');
        }
        else res.render('index', { userIn: false });
    });
    // Render '/register'
    app.get('/register', isNotLoggedIn, function (req, res)
    {
        res.render('register');
    });
    //Render '/reguser'
    app.post('/reguser', isNotLoggedIn, function (req, res)
    {
        db.saveNewUser(req.body, function (err, noDup)
        {
            if(!err){
                if(noDup){
                    res.render('login', { newreg: true });
                }
                else{
                    res.render('login', { dupreg: true });
                }
            }
            else{
                res.render('login', { errreg: true });
            }
        });
    });

    //Render Profile Page
    app.get('/profile', isLoggedIn, function (req, res)
    {
        if(isApproved(req, res)){
            db.retrieveSubsForProfile(req.user.subjects, function (subs)
            {
                res.render('profile',
                {
                 name: req.user.name,
                 bid: req.user.bid,
                 email: req.user.email,
                 subjs: subs,
                 msg: req.query.msg
                }); 
            });
        }
        else{
            res.render('noapprove');
        }
        
    });

    //Profile Edit
    app.post('/profileedit', isLoggedIn, function(req, res){
        if(req.body.newpassword === ''){
            db.editUser(req.user.id, req.body, false, function(err, noDup){
                if(err){
                    console.log(err);
                    res.redirect('/profile?msg=err');
                }
                else{
                    if(noDup){
                        res.redirect('/profile?msg=saved');
                    }
                    else{
                        res.redirect('/profile?msg=dupf');
                    }
                }
            });
        }
        else if(req.body.newpassword !== '' && req.body.registerpassword === req.user.password){
            db.editUser(req.user.id, req.body, true, function(err, noDup){
                if(err) console.log(err);
                else res.redirect('/profile?msg=saved');
            });
        }
        else if(req.body.registerpassword !== req.user.password){
            res.redirect('/profile?msg=wrpass');
        }
    });
    //Render '/login'
    app.get('/login', isNotLoggedIn, function (req, res)
    {
        res.render('login');
    })
    //Handle login post
    app.post('/loginuser', isNotLoggedIn, function (req, res, next)
    {
        passport.authenticate('local', function (err, user, info)
        {
            if (err)
            {
                console.log(err);
                return next(err);
            }
            if (!user)
            {
                return res.render('login', { wrCred: true });
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
    // Render /user-notes
    app.get('/user-notes', isLoggedIn, function (req, res)
    {
        if(isApproved(req, res)){
            if(req.query.crslug){
                db.retrieveSubsForProfile(req.user.subjects, function (subs)
                {
                    db.retrieveNoteForProfile(req.query.crslug, function(notes){
                        res.render('user-notes', {tnotes: notes, tsubs: subs, msg: req.query.msg});
                    });
                });
            }
            else{
                db.retrieveSubsForProfile(req.user.subjects, function (subs)
                {
                    db.retrieveNotesForProfile(req.user.subjects, function(notes){
                        res.render('user-notes', {tnotes: notes, tsubs: subs, msg: req.query.msg});
                    });
                });
            }
        }
        else{
            res.render('noapprove');
        }
        
    });

    //logout
    app.get('/logout', isLoggedIn, function (req, res)
    {
        req.logout();
        res.render('index');
    });

    //Lost Password
    app.get('/forgot', isNotLoggedIn,function(req, res){
        res.render('forgot');
    });
    //Load Typeahead with subject names
    app.post('/loadTASubs', function (req, res)
    {
        db.retrieveSubNames(function (err, data)
        {
            if (err)
            {
                console.log(err);
                return false;
            }
            else
            {
                res.send(JSON.stringify(data));
            }
        });
    });

    //
    //Admin Section
    //

    // Handle Admin Notes request from admin
    app.get('/managenotes', isLoggedIn, function(req, res){
        if(req.user.role !== 'admin'){
            res.render('index');
        }
        else if(req.user.role === 'admin'){
            if(req.query.crslug){
                db.retrieveSelNotesSubs(req.query.crslug, function(subs, notes){
                    res.render('admin-notes', {tnotes: notes, tsubs: subs, msg: req.query.msg});
                });
            }
            else{
                db.retrieveAllNotesSubs(function(subs, notes){
                    res.render('admin-notes', {tnotes: notes, tsubs: subs, msg: req.query.msg});
                });
            }
            
        }
    });

    //Handle Users Page request from admin
    app.get('/manageusers', isLoggedIn, function(req, res){
        if(req.user.role !== 'admin'){
            res.render('index');
        }
        else if(req.user.role === 'admin'){
            db.retrieveUsers(function(users){
                console.log(users);
               res.render('admin-users',{tusers: users, msg: req.query.msg});
            });
        }
    });

    app.post('/approveuser', isLoggedIn, function(req, res){
        if(req.user.role === 'admin'){
            db.approveUser(req.body.id, function(err){
                if(!err){
                    res.redirect('/manageusers?msg=appuser');
                }
                else{
                    console.log(err);
                    res.redirect('/manageusers?msg=error');
                }
            });
        }
    });

    app.post('/toggleuser', isLoggedIn, function(req, res){
        if(req.user.role === 'admin'){
            db.toggleUserStatus(req.body.id, function(err){
                if(!err){
                    res.redirect('/manageusers?msg=toguser');
                }
                else{
                    console.log(err);
                    res.redirect('/manageusers?msg=error');
                }
            });
        }
    });

    app.post('/deluser', function(req, res){
        if(req.user.role === 'admin'){
            db.removeUser(req.body.id, function(err){
                if(!err){
                    res.redirect('/manageusers?msg=deleted');
                }
                else{
                    console.log(err);
                    res.redirect('/manageusers?msg=error');
                }
            });
        }
    });

    //Manages courses page request from admin
    app.get('/managecourses', isLoggedIn, function(req, res){
        if(req.user.role !== 'admin'){
            res.render('index');
        }
        else if(req.user.role === 'admin'){
            db.retrieveSubNames(function(err, subs){
                if(err){
                    console.log(err);
                    return false;
                }
                else{
                    res.render('admin-courses', {tsubs: subs, msg: req.query.msg});
                }
            });
        }
    });

    //Add a new course
    app.post('/addcourse', isLoggedIn, function(req, res){
        if(req.user.role === 'admin'){
            db.saveCourse({
                name: req.body.cname,
                slug: req.body.cslug,
                Added_On: Date.now()
            }, function(err){
                if(err && err == 1){
                    res.redirect('/managecourses?msg=dupfound');
                }
                else{
                    console.log("Success! On saving Course");
                    if(fs.existsSync('./notes/'+req.body.cslug)){
                        console.log("Directory already exists");
                    }
                    else{
                        fs.mkdir('./notes/'+req.body.cslug, function(err){
                            if(err) console.log(err);
                        });
                    }
                    res.redirect('/managecourses?msg=saved');
                }
            });
        }
    });

    //Delete the course
    app.post('/delselsub', isLoggedIn, function(req, res){
        if(req.user.role == 'admin'){
            db.removeCourse(req.body.id, req.body.crslug, function(err){
                if(err){
                    res.end('<h1>500! Internal Server Erroe!</h1>')
                }
                else{
                    console.log("Success! On deleting Course");

                    res.redirect('/managecourses?msg=deleted');
                }
            });
        }
    });


    //Upload the notes
    app.post('/uploadnotes', isLoggedIn, function(req, res){
        if(req.user.role == 'admin'){
            fs.readFile(req.files.notefile.path, function(err, data){
                var newPath = './notes/'+req.body.crslug+'/'+req.files.notefile.originalFilename;
                fs.writeFile(newPath, data, function (err) {
                    if(err) console.log(err);
                    else{
                        db.saveNote({
                            name: req.body.notename,
                            Added_On: Date.now(),
                            url: './notes/'+req.body.crslug+'/'+req.files.notefile.originalFilename,
                            subName: req.body.coursename,
                            subslug: req.body.crslug
                        }, function(err){
                            if(err){
                                res.redirect("/managenotes?msg=error");
                            }
                        });
                        res.redirect("/managenotes?msg=saved");
                    }
                });
            });
        }
    });

    app.get('/download/:id', isLoggedIn, function(req, res){
        if(isApproved(req, res)){
            db.getDLink(req.params.id, function(err, file){
                if(!err){
                    res.download(file);
                }
            });
        }
        else{
            res.render('noapprove');
        }
        
    });

    app.post('/delfile', isLoggedIn, function(req, res){
        if(req.user.role == 'admin'){
            db.removeNote(req.body.id, function(err){
                res.redirect("/managenotes?msg=deleted");
            });
        }
    });
}