const db = require('./mongo')
const util = require('./sockutil')

class LogObject {
    constructor(jsonString) {
        const jsonObjectA = JSON.parse(jsonString)
        const jsonObjectB = JSON.parse(jsonObjectA._in)

        this.information = jsonObjectB;
        this.informationString = jsonObjectA._in;
        this.category = jsonObjectA._ct;
        this.message = jsonObjectA._ms;
    }
}

module.exports.svLog = (socket, byteReader) => {
    try {
        const jsonData = util.extractData(byteReader)
        const log = new LogObject(jsonData)
        const info = log.information[0]
        db.saveLog(log.information, log.category, log.message)
    } catch (error) {
        console.log("[-] An error occured while processing Save Log Command.")
        console.log(error) // save logs into fucking shit.
    }
}

let io
module.exports.oocChat = (socket, byteReader) => {
    try {
        if (!io) {
            io = require('./bin/www').io
        }

        const jsonData = util.extractData(byteReader)
        const dataObject = JSON.parse(jsonData)

        if (dataObject) {
            io.of('/chat').emit('oocChat', jsonData)
        }
    } catch (error) {
        console.log("[-] An error occured while processing Save Log Command.")
        console.log(error) // save logs into fucking shit.
    }
}