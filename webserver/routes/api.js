const express = require('express');
const router = express.Router();
const passport = require('passport')
const mongo = require('../mongo')

router.get('/verify',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
});

router.get('/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

require('./api/warn')(router, mongo)
require('./api/ban')(router, mongo)
/*
  WARNING MODULE
*/

module.exports = router;


