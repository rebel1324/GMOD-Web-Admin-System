var express = require('express');
var router = express.Router();
var loadDB = require('../mongo').loadLog
const interruptor = require('../interruptor').ensureAdministrator

router.get('/', interruptor, function(req, res, next) { // ensureAuthenticated,
  // dumbass protection
  let reqPage = Number(req.query.page) || 0
  if (reqPage < 0 || isNaN(reqPage)) {
    reqPage = 0
  }

  let filter = {}
  if (req.query.type) {
    filter.type = Number(req.query.type)
  }
  if (filter.type && (filter.type > 4 || filter.type < 0 || isNaN(filter.type))) {
    filter = {}
  } else {
    if (req.query.search) {
      filter.search = req.query.search
    } else {
      filter = {}
    }
  }


  const moment = require('moment')
  console.log(loadDB(reqPage, filter).then((data) => {
    res.render('logger', { user: req.user, logs: data, page: reqPage, rows: 50, moment: moment, filter: filter });
  }))
});

module.exports = router;
