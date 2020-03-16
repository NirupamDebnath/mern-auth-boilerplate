const User = require('../models/user');
const jwt = require('jsonwebtoken');
const expressJWT = require("express-jwt");
const _ = require('lodash');
const {OAuth2Client} = require("google-auth-library");
const fetch = require('node-fetch');
// sendgrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


exports.signup = (req,res)=>{
    const {name, email, password} = req.body

    User.findOne({ email }).exec((err, user) =>{
        if (user){
            return res.status(400).json({
                error: 'Email already exists'
            })
        }

        const token = jwt.sign({name, email, password}, process.env.JWT_ACCOUNT_ACTIVATION,{expiresIn:'10m'})
        
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Account activation link",
            html:`
                <p>Please use the link to activate your account.</p>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <hr/>
                <p>This email may contain sensative information</p>
            `
        }
        sgMail.send(emailData).then(send => {
            return res.json({
                message: `Email has been sent to ${email}. Follow the link to activate your account `
            })
        })
        .catch(err => {
            res.json({
                message: err.message
            });
        })
    })
}

exports.accountActivation = (req, res) => {
    const {token} = req.body

    if(token){
        jwt.verify(token,process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded_token) =>{
            // console.log("Decoded Token", decoded_token);
            if(err){
                console.log("JWT verify in activation error: ", err);
                return res.status(401).json({
                    error: 'Expired link. Signup again'
                })
            }

            const {name, email, password} = decoded_token;

            User.findOne({email}).exec((err, user) => {
                if(user){
                    return res.status(400).json({
                        error: "Token already used"
                    });
                }
                if(err){
                    console.log(err);
                    return res.status(400).json({
                        error: "Database error"
                    });
                }
                user = new User({name, email, password});
                user.save((err, user)=>{
                    if(err){
                        console.log('Save user in account activation error', err);
                        return res.status(401).json({
                            error: 'Error saving user in database. Please try again.'
                        });
                    }
                    
                    return res.json({
                        message: "Singup success. You can login now."
                    });
                });

            });
        });
    }
    else{
        return res.status(400).jsom({
            message: "Link broken. Please try again."
        });
    }
}

exports.signin = (req, res) =>{
    const {email, password} = req.body

    User.findOne({email}).exec((err,user) => {
        if(err || !user){
            if(err){
                console.log(err);
            }
            return res.status(400).json({
                error: "User with that email id doesn't exists. Please signup."
            });
        }
        // authenticate
        if(!user.authenticate(password)){
            return res.status(400).json({
                error: "Email and password do not match"
            });
        }
        // generate a token and send
        const {_id, name, email, role} = user

        const token = jwt.sign({_id, name, email}, process.env.JWT_SECRET, {expiresIn:'7d'})

        return res.json({
            token,
            user: {_id, name, email, role}
        })
    })
}

exports.requireSignin = expressJWT({
    secret: process.env.JWT_SECRET // req.user
})

exports.isAdminMiddleWare = (req, res, next) => {
    User.findById(req.user._id).exec((err, user)=>{
        if(err || !user){
            if(err){
                console.log(err);
            }
            return res.status(400).json({
                error: "User with that email id doesn't exists. Please signup."
            });
        }

        if(user.role !== 'admin'){
            return res.status(400).json({
                error: "Access Denied."
            })
        }

        req.profile = user
        next();
    })
}

exports.forgotPassword = (req, res) => {
    const {email} = req.body;

    User.findOne({email}, (err,user) => {
        if(err || !user){
            if(err){
                console.log(err);
            }
            return res.status(400).json({
                error: "User with that email id doesn't exists. Please signup."
            });
        }

        const token = jwt.sign({_id: user._id, name: user.name}, process.env.JWT_RESET_PASSWORD,{expiresIn:'10m'})
        
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Password reset link",
            html:`
                <p>Please use the link to reset your password.</p>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <hr/>
                <p>This email may contain sensative information</p>
            `
        }
        return user.updateOne({resetPasswordLink: token}, (err, success) => {
            if(err){
                console.log("Reset passwprd link error ", err)
                return res.status(500).json({
                    error: "Database Connection error on user password reset request"
                })
            }else{
                sgMail.send(emailData).then(send => {
                    return res.json({
                        message: `Email has been sent to ${email}. Follow the link to reset password `
                    })
                })
                .catch(err => {
                    res.json({
                        message: err.message
                    });
                })
            }
        })

    })
}

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;
    jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (err, decoded) {
        if(err){
            return res.status(400).json({
                error: 'Expired link. Please try again'
            })
        }
        User.findOne({resetPasswordLink}, (err, user) => {
            if(err || !user){
                if(err){
                    console.log(err);
                }
                return res.status(400).json({
                    error: "Link expired try again"
                });
            }

            const updatedFields = {
                password: newPassword,
                resetPasswordLink: ''
            }

            user = _.extend(user, updatedFields);
            user.save((err, result) => {
                if(err || !user){
                    if(err){
                        console.log(err);
                    }
                    return res.status(500).json({
                        error: "Error resetting password. Try again"
                    });
                }
                return res.json({
                    message: 'Password changed. Now you can log in with your new password!'
                });
            })
        })
    })
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = (req, res) => {
    const {idToken} = req.body;

    client.verifyIdToken({idToken, audience: process.env.GOOGLE_CLIENT_ID})
        .then(response => {
            console.log("Google login response",response);
            const {email_verified, name, email} = response.payload;
            if(email_verified){
                User.findOne({email}).exec((err, user) => {
                    if(user){
                        const {_id, email, role} = user;
                        const token = jwt.sign({_id, name, email}, process.env.JWT_SECRET, {expiresIn:'7d'});
                        return res.json({
                            token,
                            user: {_id, name, email, role}
                        });
                    }
                    else{
                        let password = email +new String(Math.floor(Math.random() * Math.floor(1000000)));
                        user = new User({name, email, password});
                        user.save((err, data) => {
                            if(err){
                                console.log("ERROR GOOGLE LOGIN on user save", err);
                                return res.status(500).json({
                                    error: "Failed to save data in Database. Please try again."
                                });
                            }
                            const {_id, email, role} = data;
                            const token = jwt.sign({_id, name, email}, process.env.JWT_SECRET, {expiresIn:'7d'});
                            return res.json({
                                token,
                                user: {_id, name, email, role}
                            });
                        });
                    }
                })
            }
            else {
                return res.status(400).json({
                    error: "Google login failed. Try again."
                });
            }
        })
}

exports.facebookLogin = (req, res) => {
    console.log("Facebook login request body",req.body);
    const {userID, accessToken} = req.body;

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;

    return(
        fetch(url, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(response => {
            const {email, name} = response;
            User.findOne({email}).exec((err, user) => {
                if(user){
                    const {_id, email, role} = user;
                    const token = jwt.sign({_id, name, email}, process.env.JWT_SECRET, {expiresIn:'7d'});
                    return res.json({
                        token,
                        user: {_id, name, email, role}
                    });
                }
                else{
                    let password = email +new String(Math.floor(Math.random() * Math.floor(1000000)));
                    user = new User({name, email, password});
                    user.save((err, data) => {
                        if(err){
                            console.log("ERROR Facebook LOGIN on user save", err);
                            return res.status(500).json({
                                error: "Failed to save data in Database. Please try again."
                            });
                        }
                        const {_id, email, role} = data;
                        const token = jwt.sign({_id, name, email}, process.env.JWT_SECRET, {expiresIn:'7d'});
                        return res.json({
                            token,
                            user: {_id, name, email, role}
                        });
                    });
                }
            })
        })
        .catch(err => {
            console.log('Facebook login failed ' ,err);
            return res.status(400).json({
                error: "Facebook login failed. Try again."
            });
        })
    )
}