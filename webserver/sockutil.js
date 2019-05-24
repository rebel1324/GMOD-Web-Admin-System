const net = require('net');
const bytearray = require('./bytearray')
const gmodSocketAddress = {
    port: 7974,
    ip: '127.0.0.1'
}

const newBuffer = (size) => {
    let buffer = Buffer.alloc(size || 1024)
    let ba = bytearray(buffer)
    ba.writeInt(buffer.length - 4)
    return ba
}

const isUTF8 = (byteArray) => {
    return (byteArray[0] == 239 && byteArray[1] == 191 && byteArray[2] == 189)
}

const checkMark = (byteReader) => {
    const bytes = []
    
    for (let index = 0; index < 3; index++) {
        bytes[index] = byteReader.readUnsignedByte();
    }

    return bytes
}

const newCommand = (command, data) => {
    let buffer = newBuffer()
    buffer.writeUTF(command)
    buffer.writeUTF(data)
    return buffer
}

const commandServer = (buffer) => {
    var socket = net.connect(gmodSocketAddress.port, gmodSocketAddress.ip)
    socket.on("error", function (err) { console.log(err) }) // stops crashing if connection fails
    socket.write(buffer)
    socket.end()
}

module.exports.sendCommandToServer = (command, data) => {
    commandServer(newCommand(command, data).buf)
}

const commandServerReply = (buffer) => {
    return new Promise((resolve, reject) => {
        var socket = net.connect(gmodSocketAddress.port, gmodSocketAddress.ip)
        socket.write(buffer)
    
        socket.on("error", function (error) {
            reject(error)
        }) // stops crashing if connection fails
        
        let packets // git blame bromsock
        socket.on("data", function(data) {
            if (!packets) {
                packets = data 
            } else {
                packets = Buffer.concat([packets, data])
            }
            
            if (packets.length >= 6) {
                const packetLength = parseInt(packets.readUInt16LE(0))
                const stringLength = parseInt(packets.readUInt16LE(4))
                
                resolve(packets.toString('utf8', 6, 6 + stringLength))

                socket.end()
            }
        })
    })
}

module.exports.sendCommandToServerReply = (handler, context) => {
    return new Promise((resolve, reject) => {
        commandServerReply(newCommand(handler, context).buf).then((response) => {
            resolve(response)
        }).catch((error) => {
            reject(error)
        })
    })
}

module.exports.extractData = (byteReader) => {
    const oldPos = byteReader.pos
    if (!isUTF8(checkMark(byteReader))) {
        byteReader.pos = oldPos
        byteReader.readUnsignedByte()
    }
    byteReader.readUnsignedByte()

    return byteReader.readUTFBytes(byteReader.size - byteReader.pos)
}

module.exports.newCommand = newCommand
module.exports.newBuffer = newBuffer
module.exports.checkMark = checkMark
module.exports.isUTF8 = isUTF8
module.exports.commandServer = commandServer
module.exports.commandServerReply = commandServerReply