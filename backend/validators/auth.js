const {check} = require('express-validator');


exports.userSignupValidator = [
    check('name')
    .not()
    .isEmpty()
    .withMessage("Name is required"),
    
    check('email')
    .isEmail()
    .withMessage("Enter a valid email address"),
    
    check("password")
    .isLength({ min : 6})
    .withMessage("Password must be atleast 6 character")
]

exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage("Enter a valid email address"),
    
    check("password")
        .isLength({ min : 6})
        .withMessage("Password must be atleast 6 character")
]

exports.forgotPasswordValidator = [
    check('email')
        .notEmpty()
        .withMessage("Email can't be empty")
        .isEmail()
        .withMessage("Enter a valid email address")
]

exports.resetPasswordValidator = [
    check('newPassword')
        .notEmpty()
        .withMessage("Password can't be empty")
        .isLength({ min : 6})
        .withMessage("Password must be atleast 6 character"),
    check('resetPasswordLink')
        .notEmpty()
        .withMessage("Password reset link not found")
]