module.exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/api/verify');
}

module.exports.ensureAdministrator = (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.isAdministrator > 1) {
            return next();
        }
        
        res.redirect('/noaccess')
    }
    res.redirect('/api/verify');
}

module.exports.ensureAdministratorPost = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdministrator > 1) { return next(); }
    res.status(403).send('Permission Denied.');
}

var isLocalRequest = function (req){
    var ip = req.connection.remoteAddress;
    var host = req.get('host');
    
    return ip === "127.0.0.1" || ip === "::ffff:127.0.0.1" || ip === "::1" || host.indexOf("localhost") !== -1;
}

module.exports.ensureLocalRequest = (req, res, next) => {
    if (isLocalRequest(req)) { return next(); }
    res.status(403).send('Permission Denied.');
}