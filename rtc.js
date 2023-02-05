const PORT = 8443;
const PATH = require('path');
const FS = require('fs');


const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
//const server = http.createServer(app);

const { Server } = require("socket.io");
app.use(express.static(__dirname + "/src/"));

var server = https.createServer({
    key: FS.readFileSync(__dirname + "/certs/localhost.key"),
    cert: FS.readFileSync(__dirname + "/certs/localhost.crt")
}, app);

const io = new Server(server);


class User {
    onlineUser = {};

    login(id) {
        this.onlineUser[id] = id;
    }

    logout(id) {

        if (id in this.onlineUser) {
            delete this.onlineUser[id];
        }

    }
}

const user = new User();

io.on('connect', (socket) => {

    socket.on("disconnect", (dis) => {
        user.logout(socket.id);
        io.emit('user:logout', socket.id);
    });

    var ol = user.onlineUser;

    socket.emit('list:user', {
        users: ol
    })

    user.login(socket.id);

    socket.broadcast.emit('user:login', socket.id);

    socket.on('call:request', (data) => {

        socket.to(data.to).emit('call:in', {
            offer: data.offer,
            from: socket.id
        })
    })

    socket.on('call:candidate:add', (data) => {
        socket.to(data.to).emit("call:add:candidate", data);
    })

    socket.on('call:accept', (data) => {
        socket.to(data.to).emit("call:terima", data.answer);
    })
})

app.get('/', async (req, res) => {
    var h = req.get('host').split(':');
    var fl = await FS.readFileSync(PATH.join(__dirname, 'src/rtc.html'));

    res.setHeader('content-type', 'text/html');

    var svr = `https://${h[0]}/`;

    return res.status(200).send(fl.toString().replace(new RegExp('{{web}}', 'g'), svr));
});

server.listen(PORT, () => {
    console.log('Jalan', PORT);
})