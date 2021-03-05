const express = require('express');
const User = require('../models/user');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        req.flash('success', 'Welcome to Campground');
        console.log(registeredUser);
        res.redirect('/campgrounds');
    } catch(err){
        req.flash('error', err.message);
        // console.log(err.message);
        res.redirect('register');
    }
}));

module.exports = router;