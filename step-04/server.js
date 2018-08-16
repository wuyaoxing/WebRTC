const os = require('os')
const nodeStatic = require('node-static')
const http = require('http')
const socketIO = require('socket.io')

const fileServer = new (nodeStatic.Server)()
const app = http.createServer((req, res) => {
    fileServer.serve(req, res)
}).listen(3000)

const io = socketIO.listen(app)

io.sockets.on('connection', socket => {
    function log() {
        const array = ['Message from server: ']
        array.push.apply(array, arguments)
        socket.emit('log', array)
    }

    socket.on('message', message => {
        log('Client said: ', message)
        socket.broadcast.emit('message', message)
    })

    socket.on('create or join', room => {
        log('Received request to create or join room ' + room)
        const clientsInRoom = io.sockets.manager.rooms[room]
        const numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0

        log('Room' + room + ' now has ' + numClients + ' client(s)')

        if(numClients === 0) {
            socket.join(room)
            log('Client ID ' + socket.id + ' created room ' + room)
            socket.emit('created', room, socket.id)
        }else if(numClients === 1) {
            log('Client ID' + socket.id + ' joined room ' + room)
            io.sockets.in(room).emit('join', room)
            socket.join(room)
            socket.emit('joined', room, socket.id)
            io.sockets.in(room).emit('ready')

        }else {
            socket.emit('full', room)
        }
    })
    socket.on('ipaddr', () => {
        const ifaces = os.networkInterfaces()
        for(let dev in ifaces) {
            ifaces[dev].forEach(details => {
                if(details.family === 'IPv4' && details.address !== '127.0.0.1') {
                    socket.emit('ipaddr', details.address)
                }
            })
        }
    })
})
