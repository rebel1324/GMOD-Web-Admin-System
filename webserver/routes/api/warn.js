module.exports = (router, mongo) => {
    var getWarnings = mongo.getWarnings
    var saveWarning = mongo.saveWarning
    var removeWarning = mongo.removeWarning
    router.get('/warn/get/:steamID', function (req, res) {
        var steamID = req.params.steamID;
        if (steamID) {
            getWarnings(steamID, {}).then(data => {
                res.send({
                    count: data.length,
                    data: data
                })
            })
        } else {
            res.status(500).send('No steamID provided!');
        }
    })

    router.post('/warn/remove/:warnID', ensureAuthenticatedPost, function (req, res) {
        var warnID = req.params.warnID;

        if (warnID) {
            removeWarning(warnID, req.user.id)
        }

        res.send("hi")
    })

    router.post('/warn/add', ensureAuthenticatedPost, function (req, res) {
        const bodyData = req.body
        var steamID = bodyData.steamID;

        if (steamID) {
            saveWarning(steamID, bodyData.charName, bodyData.adminID, bodyData.reason).then((mongoRes, serverRes) => {
                console.log(mongoRes, serverRes)
                res.status(200).send('Done!');
                // IF THE WARNING EXCEEDED THE LIMIT, SEND THE TCP PACKET TO THE SERVER!
            }).catch((error) => {
                console.log(error)
                res.status(500).send('Failed!');
            })
        } else {
            res.status(500).send('No steamID provided!');
        }
    })

    function ensureAuthenticatedPost(req, res, next) {
        if (req.isAuthenticated() && req.user.isAdministrator > 0) { return next(); }
        res.status(403).send('Permission Denied.');
    }
};