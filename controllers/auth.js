const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require("express-validator/check");
const User = require("../models/user");
const EMail = require("../models/email");



exports.getLogin = (req, res, next)=>{  
    const user = {
        "email" : "",
        "password" : ""
    }     
    const renderData = {
        "pageTitle" : "Login",
        "path" : "/login",
        "user" : user,
        "userData" : {
            isLoggedIn : req.session.isLoggedIn,
            isAdmin : req.session.isAdmin   
        },
        "successMsg" :  req.flash("successMsg"),
        "error" :  req.flash("error")
    }
    res.render('auth/login',renderData)
}

exports.postLogin = (req, res, next)=>{  
    const data = req.body;
    const user = {
        "email" : data.email,
        "password" : data.password
    }; 
    
    const errors = validationResult(req);

    const renderData = {
        "pageTitle": "Login",
        "path": "/login",
        "userData" : {
            isLoggedIn : req.session.isLoggedIn,
            isAdmin : req.session.isAdmin   
        },
        "user" : user,      
                    
    }
    if(!errors.isEmpty()){
        renderData.error =  errors.array()[0].msg;    
        renderData.successMsg =  ""; 
        return res.status(422).render('auth/login',renderData);
    }


    User.findUser({email : data.email}).then(user =>{
        if(user[0]){
            bcrypt.compare(data.password, user[0].password).then(match=>{
                if(match){
                    req.session.isLoggedIn = true;
                    req.session.user = user[0];
                    if(user[0].isAdmin){
                        req.session.isAdmin = true;
                    }            
                    req.session.save(err =>{            
                        res.redirect("/");
                    }); 
                }else{
                    req.flash('error', "Invalid passsword");
                    res.redirect("/login");
                }
            }).catch(err =>{
                res.redirect("/login");
            });
        }else{
            req.flash('error', "No user with that email");
            return  res.redirect("/login");
        }
    }).catch(err => {        
        res.redirect("/500");
    });
}

exports.getSignUp = (req, res, next)=>{
    const user = {
        "email" : "",
        "password" : "",
        "confirmPassword" : ""
    }     
    const renderData = {
        "pageTitle": "Sign Up",
        "path": "/signup",
        "user" : user,
        "userData" : {
            isLoggedIn : req.session.isLoggedIn,
            isAdmin : req.session.isAdmin   
        },
        "successMsg" :  req.flash("successMsg"),
        "error" :  req.flash("error"),             
    }
    res.render('auth/signup',renderData)
}

exports.postSignUp = (req, res, next)=>{  
    const data = req.body;
    const user = {
        "email" : data.email,
        "password" : data.password,
        "confirmPassword" : data.confirmPassword
    }; 
    
    const errors = validationResult(req);

    const renderData = {
        "pageTitle": "Sign Up",
        "path": "",
        "userData" : {
            isLoggedIn : req.session.isLoggedIn,
            isAdmin : req.session.isAdmin   
        },
        "user" : user,      
                    
    }
    if(!errors.isEmpty()){
        renderData.error =  errors.array()[0].msg;    
        renderData.successMsg =  ""; 
        return res.status(422).render('auth/signup',renderData);
    }
    if(data.password === data.confirmPassword && data.email !== ""){
        User.findUser({email : data.email}).then(user =>{
            if(user[0]){
                renderData.error = "User already exist";      
                renderData.successMsg =  "";          
                return res.render('auth/signup',renderData);
                              
            }else{
                bcrypt.hash(data.password, 12).then(hashedPassword =>{
                    const userData = {
                        "username" : data.email,
                        "email" : data.email,
                        "password" : hashedPassword,
                        "cart" : []
                    }  
                    const newuser = new User(userData);
                    newuser.saveUser().then(() => {
                        req.flash('successMsg', "User created now login");   
                        res.redirect("/login");                         
                        var emailData = {
                          from: 'Customer Service <andrew@andrewvc.net>',
                          to: data.email,
                          subject: 'Welcome to the Shopping App!',
                          html: `
                                User ${data.email} has been successfully created.  
                                You can now login to the shopping app.
                                Please let us know if you have any issues.
                                `
                        }; 
                        EMail.sendEmail(emailData);                           

                    }).catch(err => {                        
                        res.redirect("/500");
                    });
                }).catch(err=>{                    
                    res.redirect("/500");
                });                
            }
        }).catch(err =>{            
            res.redirect("/500");
        }) 
    }
}

exports.getForgotPassword = (req, res, next)=>{  
        
    const renderData = {
        "pageTitle" : "Forgot Password",
        "path" : "/forgot-password",
        "email" : "",
        "userData" : {
            isLoggedIn : req.session.isLoggedIn,
            isAdmin : req.session.isAdmin   
        },
        "successMsg" :  req.flash("successMsg"),
        "error" :  req.flash("error")
    }
    res.render('auth/forgot-password',renderData)
}

exports.postForgotPassword = (req, res, next)=>{ 
    const data = req.body;         
    crypto.randomBytes(32,(err,buffer)=>{
    if(err){
        
        return res.redirect('/forgot-password');
    }
    const token = buffer.toString("hex");
    User.findUser({email : data.email}).then(user =>{
        if(user[0]){            
            var updateData = {
                resetToken : token,
                resetTokenExpiration: Date.now() + 3600000
            }
            User.updateUser(user[0]._id, updateData).then(() =>{
                const resetUrl = `http://localhost:3000/reset-password/${token}`;
                var emailData = {
                    from: 'Shopping App - Forgot Password <andrew@andrewvc.net>',
                    to: data.email,
                    subject: 'Reset Password Link',
                    html: `
                    <p> You selected a password reset </p>
                    <p><a href="${resetUrl}">Reset Password</a> is only good for one hour</p>
                    `
                }; 
                EMail.sendEmail(emailData);                

                req.flash('successMsg', "Reset Link Sent");
                return  res.redirect("/login"); 


            }).catch(err => {                
                res.redirect("/500");
            });              
        }else {
            req.flash('error', "No account with that email");
            return  res.redirect("/forgot-password"); 
        }
    }).catch(err => {        
        res.redirect("/500");
    });    
   })
}

exports.getResetPassword = (req, res, next)=>{  
    const resetToken = req.params.resetToken;
    User.findUser({resetToken : resetToken}).then(user =>{
        if(user[0]){             
            if(user[0].resetTokenExpiration > Date.now()){ 
                const renderData = {
                    "pageTitle" : "Reset Password",
                    "path" : "/reset-password",
                    "resetToken": resetToken,
                    "password" : "",
                    "confirmPassword": "",
                    "userData" : {
                        isLoggedIn : req.session.isLoggedIn,
                        isAdmin : req.session.isAdmin,
                        
                    },
                    "successMsg" :  req.flash("successMsg"),
                    "error" :  req.flash("error")
                }
                res.render('auth/reset-password',renderData)
            }else{
                req.flash('error', "Reset link has expired.");
                return  res.redirect("/forgot-password"); 
            } 
        }else{
            req.flash('error', "No user found");
            return  res.redirect("/forgot-password"); 
        } 
    }).catch(err=>{        
        req.flash('error', "No user found");
        return  res.redirect("/forgot-password"); 
    });
   
}

exports.postResetPassword = (req, res, next)=>{ 
    const data = req.body;
    const resetToken = data.resetToken;
    User.findUser({resetToken : resetToken}).then(user =>{
        if(user[0]){
            bcrypt.hash(data.password, 12).then(hashedPassword =>{
                const updateData = {                   
                    "password" : hashedPassword,
                    "resetToken" : null,
                    "resetTokenExpiration": null
                } 
                User.updateUser(user[0]._id, updateData).then(() =>{
                    req.flash('successMsg', "Password Reset successfully!");
                    return  res.redirect("/login");
                }).catch(err => {                    
                    res.redirect("/500");
                });
            }).catch(err => {
                res.redirect("/500");
            }); 
        }else{
            req.flash('error', "No user found");
            return  res.redirect("/forgot-password"); 
        }
    }).catch(err => {
        req.flash('error', "Error, please try again");
        return  res.redirect("/forgot-password");         
    })  
}

exports.getLogout = (req, res, next)=>{
    req.session.destroy(err=>{
        
        res.redirect("/");
    });    
}