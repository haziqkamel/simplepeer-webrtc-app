const express = require('express')
const http = require('http')
const { v4: uuidv4 } = require('uuid')
const cors = require('cors')
const twilio = require('twilio')

const PORT = process.env.PORT || 5002

const app = express()
const server = http.createServer(app);

app.use(cors())

let connectedUsers = [];
let rooms = [];

// Create Route to check if room exists
app.get('/api/room-exist/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms.find(room => room.id === roomId);

    if (room) {
        if (room.connectedUsers.length > 3) {
            return res.send({ roomExists: true, full: true })
        }
        return res.send({ roomExists: true, full: false })
    }
    return res.send({ roomExists: false });
})

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        method: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`)
})

server.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})
