const logme = (message) => {console.log("[WS:Chat] " + message)}
const saveLog = require('./mongo').saveLog
const getBan = require('./mongo').getBan

module.exports = (io) => {
    var sendToServer = require('./sockutil').sendCommandToServerReply
    var ooc = io.of('/chat');

    ooc.on('connection', function(socket){
        logme("New Connection Established: OOC Chat")
        
        socket.on('chatToServer', function (message) {
            try {
                var userPassport = socket.request.session.passport.user;

                if (userPassport) {
                    const chatData = {
                        power: userPassport.isAdministrator || 0,
                        name: userPassport.displayName || "???",
                        text: message || ""
                    }

                    getBan(userPassport.id, {}).then(data => {
                        if (data.length <= 0) { // 등신 방지
                            sendToServer("socketChat", JSON.stringify(chatData)).then(response => {
                                saveLog({
                                    ip: "WEB",
                                    steamname: userPassport.displayName,
                                    jobName: "-",
                                    name: userPassport.displayName,
                                    steamID: userPassport.id
                                }, 98, "[WEBOOC] " + userPassport.displayName + ": " + message)
        
                                ooc.emit('oocChat', response)
                            }).catch(error => {
                                socket.emit('serverMsg', {
                                    type: -1,
                                    text: "서버에서 오류가 발생하였습니다."
                                })
                            })
                        } else {
                            socket.emit('serverMsg', {
                                type: -1,
                                text: "당신은 서버 이용이 제한된 인원입니다."
                            })
                        }
                    })
                }
            } catch(e) {
                // well shit then no OOC Chat for you asshole.
            }
        });  
    });
}