var express = require('express');
var router = express.Router();
var loadDB = require('../mongo').loadWarnings
const interruptor = require('../interruptor').ensureAdministrator

router.get('/', interruptor, function(req, res, next) { // ensureAuthenticated,
  const moment = require('moment')
  console.log(loadDB().then((data) => {
    res.render('warns', { user: req.user, warns: data, rows: 50, moment: moment });
  }))
});

module.exports = router;
