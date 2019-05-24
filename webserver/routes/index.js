var express = require('express');
var router = express.Router();
const interruptor = require('../interruptor').ensureAuthenticated

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { user: req.user, text: "00700" });
});
router.get('/noaccess', function(req, res, next) {
  res.render('redir/noaccess', { user: req.user });
});

router.get('/chat', interruptor, function(req, res, next) {
  res.render('ooc', { user: req.user });
});

module.exports = router;
