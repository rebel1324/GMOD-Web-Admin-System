
    var sendToServer = require('./sockutil').sendCommandToServerReply
    sendToServer("getPlayers", "").then(response => {
        console.log(response)
    }).catch(error => {
        console.log("what?")
    })