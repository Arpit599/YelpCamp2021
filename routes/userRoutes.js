const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const usersContorller = require('../controllers/users');

router.route('/register')
    .get(usersContorller.renderRegisterForm)
    .post(catchAsync(usersContorller.registerNewUser));

router.route('/login')
    .get(usersContorller.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), usersContorller.login
);

router.get('/logout', usersContorller.logout);

module.exports = router;