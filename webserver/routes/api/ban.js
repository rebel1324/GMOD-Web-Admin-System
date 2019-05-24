/*
    EXECUTION ALERT
    this moderation signals is for internal use!
*/
const interruptor = require('../../interruptor').ensureAdministratorPost
const interruptorLocal = require('../../interruptor').ensureLocalRequest

module.exports = (router, mongo) => {
    var getBan = mongo.getBan
    var saveBan = mongo.saveBan
    var removeBan = mongo.removeBan

    var getBan = mongo.getBan
    router.get('/ban/get/:steamID', (req, res) => {
        var steamID = req.params.steamID;
        if (steamID) {
            getBan(steamID, {}).then(data => {
                res.send({
                    count: data.length,
                    data: data
                })
            })
        } else {
            res.status(500).send('No steamID provided!');
        }
    })

    router.post('/ban/update', interruptorLocal, (req, res) => {
        const bodyData = req.body
        const { steamID, adminID, lastName, duration, durationActual, reason } = bodyData
        
        saveBan(steamID, adminID, duration, durationActual, reason, lastName, false).then((mongoRes, serverRes) => {
            res.status(200).send();
        }).catch((error) => {
            console.log(error)
            res.status(500).send();
        })
    })
    
    router.post('/ban/lift', interruptorLocal, (req, res) => {
        const bodyData = req.body
        var steamID = bodyData.steamID;

        if (steamID) {
            removeBan(steamID, bodyData.adminID).then((mongoRes, serverRes) => {
                res.status(200).send();
            }).catch((error) => {
                console.log(error)
                res.status(500).send();
            })
        } else {
            res.status(500).send();
        }
    })

    /*
        Web API
    */
    const commandReply = require('../../sockutil').sendCommandToServerReply
    router.post('/ban/add', interruptor, (req, res) => {
        const bodyData = req.body

        if (bodyData) {
            commandReply("serverTime", "").then(osTime => {
                var { steamID, adminID, lastName, duration, reason } = bodyData
                duration = parseInt(duration) || 0
                var serverDuration = parseInt(osTime) + parseInt(duration)

                saveBan(steamID, adminID, serverDuration, duration, reason, lastName, true).then((mongoRes, serverRes) => {
                    res.status(200).send();
                }).catch((error) => {
                    console.log(error)
                    res.status(500).send();
                })
            }).catch(error => {
                res.status(500).send();
            })

            res.status(200).send();
        } else {
            res.status(500).send();
        }
    })
    router.post('/ban/remove', interruptor, (req, res) => {
        const bodyData = req.body
        var steamID = bodyData.steamID;

        if (steamID) {
            removeBan(steamID, bodyData.adminID).then((mongoRes, serverRes) => {
                res.status(200).send();
            }).catch((error) => {
                console.log(error)
                res.status(500).send();
            })
        } else {
            res.status(500).send();
        }
    })
};

