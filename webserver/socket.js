const net = require('net');
const bytearray = require('./bytearray')
const server = net.createServer();

//emitted when server closes ...not emitted until all connections closes.
server.on('close',function(){
  console.log('[TCP-] TCP Comm Server closed! What?');
});

// emitted when new client connects
server.on('connection',function(socket){
    var rport = socket.remotePort;
    var raddr = socket.remoteAddress;
    console.log('[TCP+] New client connection established:' + rport);
    //var no_of_connections =  server.getConnections(); // sychronous version
    server.getConnections(function(error,count){
        console.log('Number of concurrent connections to the server : ' + count);
    });

    socket.setEncoding('utf8');
    
    socket.on('drain',function(){
        console.log('[TCP-] TCP Drain. Write buffer is empty.');
        socket.resume();
    });

    socket.on('error',function(error){
        console.log('[TCP-] Error : ' + error);
    });

    socket.on('timeout',function(){
        console.log('[TCP-] Socket timed out !');
        socket.end('Timed out!');
    // can call socket.destroy() here too.
    });
    
    let data = []
    socket.on('data',function(buffer){
        data.push(buffer)
    });
    
    socket.on('close',function(error){
        doProcess(socket, data)
    }); 
});

// emits when any error occurs -> calls closed event immediately after this.
server.on('error',function(error){
  console.log('[TCP-] Error: ' + error);
});

//emits when server is bound with server.listen
server.on('listening',function(){
  console.log('[TCP+] Server is listening!');
});

server.maxConnections = 3;

// for dyanmic port allocation
server.listen(6994, function(){
  var address = server.address();
  var port = address.port;
  var family = address.family;
  var ipaddr = address.address;
  console.log('[TCP+] Server is listening at port' + port);
  console.log('[TCP+] Server ip :' + ipaddr);
  console.log('[TCP+] Server is IP4/IP6 : ' + family);
});

const commands = require('./tcpcomms')
const util = require('./sockutil')

function doProcess(socket, data) {
    try {
        const buffer = Buffer.from(data.join(''));
        let byteReader = bytearray(buffer); 
        if (util.isUTF8(util.checkMark(byteReader))) {
            util.checkMark(byteReader) // some marker
        } else {
            byteReader.pos = 0
            byteReader.readByte() // NOT UTF8
            util.checkMark(byteReader) // some marker
        }
        const command = byteReader.readUTF()
        console.log("[TCP+] Received Command: " + command);
        if (commands[command]) {
            commands[command](socket, byteReader)
        }
    } catch (error) {
        console.log("[-] An error occured while processing the TCP packet.")
        console.log(error) // save logs into fucking shit.
    }
}

module.exports = server