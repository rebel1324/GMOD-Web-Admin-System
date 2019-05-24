const express = require('express');
const mongo = require('../mongo')
const router = express.Router();
const loadBan = mongo.loadBan
const moment = require('moment')
const interruptor = require('../interruptor').ensureAdministrator

/* GET home page. */
router.get('/', interruptor, function(req, res, next) {
  loadBan({}).then(data => {
    res.render('ban', { user: req.user, bans: data,  moment: moment  });
  })
});

module.exports = router;
