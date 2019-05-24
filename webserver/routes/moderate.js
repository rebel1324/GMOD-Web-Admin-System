var express = require('express');
var router = express.Router();
var commandReply = require('../sockutil').sendCommandToServerReply
const interruptor = require('../interruptor').ensureAdministrator
const interruptorPost = require('../interruptor').ensureAdministratorPost

router.get('/', interruptor, function(req, res, next) { // 
    const moment = require('moment')
    res.render('moderate', { user: req.user, moment: moment });
});

router.post('/get', interruptorPost, function(req, res, next) {
    commandReply("getPlayers", "").then(response => {
        let unordered = JSON.parse(response), ordered = {}, keys = [];
        for (const key in unordered) { keys.push(key) }
        keys.sort().forEach(key => { ordered[key] = unordered[key] })

        res.send(ordered)
    }).catch(error => {
        console.log(error)
    })
})

router.post('/kick', interruptorPost, function(req, res, next) {
    var steamID = req.body.steamID;
    if (steamID) {
        commandReply("kickID", JSON.stringify(req.body)).then(response => {
            res.send(response)
        }).catch(error => {
            console.log(error)
        })
    }
})

router.post('/ban', interruptorPost, function(req, res, next) {
    var steamID = req.body.steamID;
    if (steamID) {
        commandReply("banID", JSON.stringify(req.body)).then(response => {
            res.send(response)
        }).catch(error => {
            console.log(error)
        })
    }
})

module.exports = router;
