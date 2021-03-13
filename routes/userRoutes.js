const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const usersContorller = require('../controllers/users');

router.get('/register', usersContorller.renderRegisterForm);

router.post('/register', catchAsync(usersContorller.registerNewUser));

router.get('/login', usersContorller.renderLoginForm);

router.post('/login',
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    usersContorller.login
);

router.get('/logout', usersContorller.logout);

module.exports = router;