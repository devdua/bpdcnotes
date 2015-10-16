/*
DbControl.js
Functions: 
		1) Connect to database.
		2) Retrieve data.
		4) Authenticate users
		3) Execute queries
		4) Update or remove data.
Added Modules:
1) Mongoose (For using database).
2) All models (For database usage).
3) Passport (For authentication).
4) Passport-local (For authentication). 

*/

/*Requirements*/
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');

/*Mongoose objects*/
var Schema = mongoose.Schema;
var db = mongoose.connection;

//Schemas
var Users = new Schema({
	uid: Number,
	name: String,
	bid: String,
    isApproved: Number,
	email: String,
	role: String,
	password: String,
	subjects: Array
});
var Notes = new Schema({
	name: String,
	Added_On: Date,
	url: String,
    subName: String,
	subslug: String
});
var subjects = new Schema({
	name: String,
	slug: String,
	Added_On: Date
});

Users.methods.validPassword = function (pw)
{
    if (this.password == pw) return true;
    else return false;
}

//Models
var user = mongoose.model('user', Users);
var note = mongoose.model('note', Notes);
var course = mongoose.model('course', subjects);

/*Authentication*/
passport.use(new LocalStrategy({
    usernameField: 'loginmail',
    passwordField: 'loginpassword'
}, function (mail, password, done)
{
    user.findOne({ email: mail }, function (err, user)
    {
        if(err) return done(err);
        if(!user)
        {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if(!user.validPassword(password)){
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
}));

//USer Serialize & deserialize
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(_id, done) {
  user.findById(_id, function(err, user) {
    done(err, user);
  });
});

//Hidden Functions
function delCourseFiles(cslug){
    note.find({subslug: cslug}, function(err, docs){
        if(docs){
            docs.forEach(function(doc){
                doc.remove(function(err){
                    if(err){
                        console.log("Problem in removing files");
                        console.log(err);
                    }
                });
            });
        }
        fs.rmdir('./notes/'+ cslug);

    });
}

function subNames(cb)
{
    var j = Array();
    course.find().exec(function (err, models)
    {
        if (err)
        {
            console.log(err);
            cb(err);
        }
        else
        {
            models.forEach(function (model)
            {
                var k = {
                    "id": model.id,
                    "name": model.name,
                    "slug": model.slug
                }
                j.push(k);
            });
        }
        cb(err, j);
    });
}

function repeatedBIDProfile(cbid, cb){
    user.find({bid:cbid}).exec(function(err, models){
        console.log(models);
        if(!err){
            if(models.length <= 1) cb(null, true);
            else if(models.length > 1) cb(null, false);
        }
        else{
            console.log(err);
            cb(err);
        }
    });
}

function repeatedBID(cbid, cb){
    user.find({bid:cbid}).exec(function(err, models){
        if(!err){
            if(models.length === 0){
                // console.log("from ID checking");
                // console.log(models);
                cb(null, true);
            }
            else cb(null, false);
        }
        else{
            console.log(err);
            cb(err);
        }
    });
}

function repeatedEmail(cmail, cb){
    user.find({email:cmail}).exec(function(err, models){
        if(!err){
            if(models.length === 0){
                // console.log("from Mail chacking");
                // console.log(models);
                cb(null, true);
            }
            else cb(null, false);
        }
        else{
            console.log(err);
            cb(err);
        }
    });
}

/*Exporting Object*/
module.exports = {
    connectDB: function (urlSting, callBack)
    {
        mongoose.connect(urlSting);
        db.on('error', function ()
        {
            callBack("error! Could not connect to database!");
        });
        db.once('open', function ()
        {
            callBack("connection established with database!");
        });
    },

    saveNewUser: function (userData, cb)
    {
        user.count({}, function(err, count){
            var data = new user(
            {
                uid: count+1,
                name: userData.registername,
                bid: userData.registerid.toUpperCase(),
                isApproved: 0,
                email: userData.registeremail,
                role: 'user',
                password: userData.registerpassword,
                subjects: userData.courses
            });

            repeatedBID(userData.registerid.toUpperCase(), function(err, continueSave){
                if(!err){
                    if(continueSave === true){
                        repeatedEmail(userData.registeremail, function(err, doContinueSave){
                            if(!err){
                                if(doContinueSave === true){
                                    data.save(function(err){
                                        if(err){
                                            console.log(err);
                                            cb(err);
                                        }
                                        else{
                                            cb(err, true);
                                        }
                                    });
                                }
                                else{
                                    cb(null, false);
                                }
                            }
                            else{
                                console.log("While checking for dup email");
                                console.log(err);
                                cb(err);
                            }
                        });
                    }
                    else{
                        cb(null, false);
                    }
                }
                else{
                    console.log("While checking for dup bid");
                    console.log(err);
                    cb(err);
                }
            });
        });
    },

    editUser: function(currentUserId, newData, changePass, cb){
        repeatedBIDProfile(newData.registerid.toUpperCase(), function(err, continueSave){
            if(!err){
                if(continueSave === true){
                    if(changePass === true){
                        user.findByIdAndUpdate(currentUserId, {$set: {
                            name: newData.registername,
                            bid: newData.registerid.toUpperCase(),
                            password: newData.newpassword,
                            subjects: newData.courses ? newData.courses : []

                        }}, function(err){
                            if(err){
                                console.log("With Password");
                                cb(err);    
                            }
                            else{
                                cb(null, true);
                            }
                        });
                    }
                    else{
                        user.findByIdAndUpdate(currentUserId, {$set: {
                            name: newData.registername,
                            bid: newData.registerid.toUpperCase(),
                            subjects: newData.courses ? newData.courses : []

                        }}, function(err){
                            if(err){
                                console.log("No Password");
                                cb(err);
                            }
                            else{
                                cb(null, true);
                            }
                        });
                    }
                }
                else{
                    cb(null, false);
                }
            }
            else{
                console.log(err);
                cb(err);
            }
        });
    },

    removeUser: function(userId, cb){
        user.remove({_id: userId}, function(err, rmuser){
            if(err){
                console.log("Problem in removing!")
                console.log(err);
                cb(err);
                return false;
            }
            else{
                console.log(JSON.stringify(rmuser));
                cb();
            }
        });
    },

    retrieveSubsForProfile: function (slugs, cb)
    {
        var j = Array();
        course.find({slug:{$in:slugs}}, 'name slug', function(err, subs){
            if(err){
                console.log(err);
                return err;
            }
            else{
                cb(subs);
            }
        });
    },

    retrieveNotesForProfile: function(slugs, cb){
        var k = Array();
        note.find({subslug: {$in:slugs}}).exec(function (err, models)
        {
            if (err)
            {
                console.log(err);
                cb(err);
            }
            else
            {
                models.forEach(function (model)
                {
                    var kc = {
                        "id": model.id,
                        "name": model.name,
                        "subName": model.subName,
                        "url": model.url,
                        "subslug": model.subslug
                    }

                    k.push(kc);
                });
            }
            cb(k);
        });
    },

    toggleUserStatus: function(userId, cb){
        user.findOne({_id: userId}, function(err, founduser){
            if(founduser.role === 'user'){
                user.findByIdAndUpdate(userId, {$set: {
                    role: "admin"
                }}, function(err){
                    console.log("With Password");
                    cb(err);
                });
            }
            else if(founduser.role === 'admin'){
                user.findByIdAndUpdate(userId, {$set: {
                    role: "user"
                }}, function(err){
                    console.log("With Password");
                    cb(err);
                });
            }
        });
    },

    approveUser: function(userId, cb){
        user.findOne({_id: userId}, function(err, founduser){
            if(founduser.isApproved === 0){
                user.findByIdAndUpdate(userId, {$set: {
                    isApproved: 1
                }}, function(err){
                    console.log("@ Approving");
                    cb(err);
                });
            }
        });
    },

    retrieveUsers: function(cb){
        var k = Array();
        user.find().exec(function(err, models){
            if (err)
            {
                console.log(err);
                cb(err);
            }
            else
            {
                models.forEach(function (model)
                {
                    var kc = {
                        "id": model.id,
                        "name": model.name,
                        "email": model.email,
                        "bid": model.bid,
                        "isApproved": model.isApproved,
                        "role": model.role,
                    }

                    k.push(kc);
                });
            }
            cb(k);
        });
    },

    retrieveNoteForProfile: function(slug, cb){
        var k = Array();
        note.find({subslug: slug}).exec(function (err, models)
        {
            if (err)
            {
                console.log(err);
                cb(err);
            }
            else
            {
                models.forEach(function (model)
                {
                    var kc = {
                        "id": model.id,
                        "name": model.name,
                        "subName": model.subName,
                        "url": model.url,
                        "subslug": model.subslug
                    }

                    k.push(kc);
                });
            }
            cb(k);
        });
    },

    retrieveSubNames: function (cb)
    {
        var j = Array();
        course.find().exec(function (err, models)
        {
            if (err)
            {
                console.log(err);
                cb(err);
            }
            else
            {
                models.forEach(function (model)
                {
                    var k = {
                        "id": model.id,
                        "name": model.name,
                        "slug": model.slug
                    }
                    j.push(k);
                });
            }
            cb(err, j);
        });
    },
    retrieveSelNotesSubs: function(crSlug, cb){
        var j = Array();
        var k = Array();

        course.find().exec(function (err, models)
        {
            if (err)
            {
                console.log(err);
                cb(err);
            }
            else
            {
                models.forEach(function (model)
                {
                    var jc = {
                        "id": model.id,
                        "name": model.name,
                        "slug": model.slug
                    }
                    j.push(jc);
                });
            }
            note.find({subslug: crSlug}).exec(function (err, models)
            {
                if (err)
                {
                    console.log(err);
                    cb(err);
                }
                else
                {
                    models.forEach(function (model)
                    {
                        var kc = {
                            "id": model.id,
                            "name": model.name,
                            "subName": model.subName,
                            "url": model.url,
                            "subslug": model.subslug
                        }

                        k.push(kc);
                    });
                }
                cb(j, k);
            });
        });

    },

    retrieveAllNotesSubs: function(cb){
        var j = Array();
        var k = Array();

        course.find().exec(function (err, models)
        {
            if (err)
            {
                console.log(err);
                cb(err);
            }
            else
            {
                models.forEach(function (model)
                {
                    var jc = {
                        "id": model.id,
                        "name": model.name,
                        "slug": model.slug
                    }
                    j.push(jc);
                });
            }
            note.find().exec(function (err, models)
            {
                if (err)
                {
                    console.log(err);
                    cb(err);
                }
                else
                {
                    models.forEach(function (model)
                    {
                        var kc = {
                            "id": model.id,
                            "name": model.name,
                            "subName": model.subName,
                            "url": model.url,
                            "subslug": model.subslug
                        }

                        k.push(kc);
                    });
                }
                cb(j, k);
            });
        });

    },

    saveCourse: function(subData, cb){
        course.find({slug: subData.slug}, function(err, docs){
            if(docs.length === 0){
                var data = new course(subData);
                data.save(function (err)
                {
                    if (err){
                        console.log("Problem in saving course!")
                        cb(err);
                    }
                    else cb(0);
                });
            }
            else{
                console.log(docs);
                cb(1);
            }
        });
    },

    removeCourse: function(cid, cslug, cb){
        course.remove({_id: cid}, function(err, sub){
            if(err){
                console.log("Problem in removing!")
                console.log(err);
                cb(err);
                return false;
            }
            else{
                console.log(JSON.stringify(sub));
                delCourseFiles(cslug);
                cb();

            }
        });
    },

    saveNote: function(noteData, cb){
        var data = new note(noteData);
        data.save(function(err){
            if (err){
                console.log("Problem in saving course!");
                console.log(err);
                cb(err);
            }
        });
    },

    getDLink: function(fileID, cb){
        note.findOne({_id: fileID}, function(err, file){
            cb(err, file.url);
        });
    },

    removeNote: function(fileID ,cb){
        note.findOne({_id: fileID}, function(err, file){
            if(fs.existsSync(file.url)){
                fs.unlinkSync(file.url);
            }
            file.remove(function(err){
                if(err){
                    console.log("Problem in removing files");
                    console.log(err);
                    cb(err);
                }
                else{
                    cb(null);
                }
            });

        });
    }
}