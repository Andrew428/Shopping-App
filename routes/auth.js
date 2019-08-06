const express = require("express");
const { check } = require("express-validator/check");
const router = express.Router();
const authController = require("../controllers/auth");


router.get('/login', authController.getLogin);

router.post('/login', 
    check('email')
        .isEmail()
        .withMessage('Email address is not valid')
        .normalizeEmail(),
    check('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 chars long')
        .trim(),
        //.matches(/\d/).withMessage('Must contain a number'),
    authController.postLogin);

router.get('/signup', authController.getSignUp);

router.post('/signup', 
    check('email')
        .isEmail()
        .withMessage('Email address is not valid')
        .normalizeEmail(), 
    check('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 chars long')
        .trim(),
    check('confirmPassword', 'Confirm Password field must have the same value as the Password field')
        .exists()
        .custom((value, { req }) => value === req.body.password)
        .trim(),  
    authController.postSignUp);

router.get('/forgot-password', authController.getForgotPassword);

router.post('/forgot-password', authController.postForgotPassword);

router.get('/reset-password/:resetToken', authController.getResetPassword);

router.post('/reset-password', authController.postResetPassword);

router.get('/logout', authController.getLogout);

exports.routes = router;