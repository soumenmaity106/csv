var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get newUser model
var Newuser = require('../models/newuser');

// Get User Index

router.get('/', isAdmin, function (req, res) {
    var count;

    Newuser.count(function (err, c) {
        count = c;
    })

    Newuser.find(function (err, newusers) {
        res.render('admin/allusers', {
            newusers: newusers,
            count: count
        });
    });
});

// Get Add User
router.get('/add-user', isAdmin, function (req, res) {
    res.render('admin/add_user', {

    });
});

// Post Add User

router.post('/add-user', function (req, res) {
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    var user_name = req.body.user_name;
    var user_phone = req.body.user_phone;
    var user_email = req.body.user_email;
    var user_company_name = req.body.user_company_name;
    var years_of_exp = req.body.years_of_exp;
    var technical = req.body.technical;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_product', {
            user_name: user_name,
            user_phone: user_phone,
            user_email: user_email,
            user_company_name: user_company_name,
            years_of_exp: years_of_exp,
            technical: technical
        });

    } else {
        var newuser = new Newuser({
            user_name: user_name,
            user_phone: user_phone,
            user_email: user_email,
            user_company_name: user_company_name,
            years_of_exp: years_of_exp,
            technical: technical,
            image: imageFile,
        });
        newuser.save(function (err) {

            if (err)
                return console.log(err);
            mkdirp('public/user_images/' + newuser._id, function (err) {
                return console.log(err);
            });

           

            if (imageFile != "") {
                var newuserImage = req.files.image;
                var path = 'public/user_images/' + newuser._id + '/' + imageFile;

                newuserImage.mv(path, function (err) {
                    return console.log(err);
                })
            }

            req.flash('success', 'Product added');
            res.redirect('/admin/users');
        });
    }
});

//Get Edit User

router.get('/edit-user/:id', isAdmin, function (req, res) {
    var errors;
    if (req.session.errors)
        errors = req.session.errors;

    req.session.errors = null;

    Newuser.findById(req.params.id, function (err, p) {
        if (err) {
            console.log(err);
            res.redirect('/admin/users')
        } else {
            var userDir = 'public/user_images/' + p._id;
            fs.readdir(userDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    res.render('admin/edit_user', {
                        user_name: p.user_name,
                        errors: errors,
                        user_phone: p.user_phone,
                        user_email: p.user_email,
                        user_company_name: p.user_company_name,
                        years_of_exp: p.years_of_exp,
                        technical: p.technical,
                        image: p.image,
                        id: p._id

                    });
                }
            })
        }
    });


});

// Post Edit User

router.post('/edit-user/:id', function (req, res) {
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    var user_name = req.body.user_name;
    var user_phone = req.body.user_phone;
    var user_email = req.body.user_email;
    var user_company_name = req.body.user_company_name;
    var years_of_exp = req.body.years_of_exp;
    var technical = req.body.technical;
    var pimage = req.body.pimage;
    var id = req.params.id;
    var errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/users/edit-user/' + id);
    } else {
        Newuser.findById(id, function (err, p) {
            if (err) console.log(err);
            p.user_name = user_name;
            p.user_phone = user_phone;
            p.user_email = user_email;
            p.user_company_name = user_company_name;
            p.years_of_exp = years_of_exp;
            p.technical = technical;

            if (imageFile != "") {
                p.image = imageFile;
            }

            p.save(function (err) {
                if (err) console.log(err)

                if (imageFile != "") {
                    if (pimage != "") {
                        fs.remove("public/user_images/" + id + '/' + pimage, function (err) {
                            if (err) console.log(err)
                        })
                    }
                    var userImage = req.files.image;
                    var path = 'public/user_images/' + id + '/' + imageFile;

                    userImage.mv(path, function (err) {
                        return console.log(err);
                    })
                }
                req.flash('success', 'User Edited');
                res.redirect('/admin/users');
            })

        });
    }
});


// Get Delete user 

router.get('/delete-user/:id', isAdmin, function (req, res) {
    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err)
        } else {
            Newuser.findByIdAndRemove(id, function (err) {
                console.log(err)
            })
            req.flash('success', 'User Deleted')
            res.redirect('/admin/users')
        }
    })
});

//Export
module.exports = router;

