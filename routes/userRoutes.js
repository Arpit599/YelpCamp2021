const express = require('express');
const User = require('../models/user');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Campground');
            console.log(registeredUser);
        });
        res.redirect('/campgrounds');
    } catch(err){
        req.flash('error', err.message);
        // console.log(err.message);
        res.redirect('register');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'Welcome Back!');
    const route = req.session.returnTo || '/campgrounds';
    // console.log(req.session);
    delete req.session.returnTo;
    // console.log(req.session);
    res.redirect(route);
});

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', 'Good Bye!');
    res.redirect('/campgrounds');
});

module.exports = router;