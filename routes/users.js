var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');
/*
* Get User model
*/
var User = require('../models/user');

/*
* GET register
*/
router.get('/register', function (req, res) {
    res.render('register',{
        Title:'Register',
        
    })
});

/*
* Register User
*/
router.post('/register',function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('email','Name is required').isEmail();
    req.checkBody('username','Name is required').notEmpty();
    req.checkBody('password','Name is required').notEmpty();
    req.checkBody('password2','Name is required').equals(password);

    var errors = req.validationErrors();

    if(errors) {
        res.render('register',{
            errors:errors,
            user:null,
            Title:'Register'
        })
    }else{
        User.findOne({username:username},function(err,user){
            if(err)
            console.log(err);

            if(user){
                req.flash('danger','Username exists Choose anther');
                res.redirect('/users/register');
            }else{
                var user = new User({
                    name:name,
                    email:email,
                    username:username,
                    password:password,
                    admin: 0
                })
                bcrypt.genSalt(10,function(err,salt){
                    bcrypt.hash(user.password,salt,function(err,hash){
                        if(err)
                        console.log(err)

                        user.password = hash

                        user.save(function(err){
                            if(err){
                                console.log(err)
                            }else{
                                req.flash('success','you are now registerd');
                                res.redirect('/users/login')
                            }
                            
                        }) 
                    })
                })
            }
        })
    }

})

/*
* GET login
*/
router.get('/login', function (req, res) {
     if(res.locals.user) res.redirect('/')
    res.render('login',{
        Title:'Admin Login',
        
    })
}); 

/*
* Post Login
*/

router.post('/login',function(req,res,next){
    passport.authenticate('local',{
        successRedirect:'/admin/users',
        failureRedirect:'/users/login',
        failureFlash:true
    })(req,res,next)
});

/*
* Get logout
*/
router.get('/logout',function(req,res){
    req.logout();

    req.flash('success','You are log out');
    res.redirect('/users/login')
})


//Export
module.exports = router; 