const PORT = 6443;
const PATH = require('path');
const FS = require('fs');
const mysql = require('mysql2');

const conn = mysql.createConnection(
    { host: 'localhost', user: 'root', password: 'v0ks3l199', database: 'coba' }
);

const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
//const server = http.createServer(app);

const { Server } = require("socket.io");
app.use(express.static('src'));

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

    socket.on('call:candidate:push', (data) => {
        socket.to(data.to).emit("call:candidate:pull", data);
    })

    socket.on('call:accept', (data) => {
        data.from = socket.id;
        socket.to(data.to).emit("call:terima", data);
    });

    socket.on('terima:file', async (fl, cb) => {
        console.log(Buffer.byteLength(fl));
        try {
            var w = await FS.writeFileSync(PATH.join(__dirname, 'uploads', 'tes.png'), fl);

            conn.execute('INSERT INTO emp(`file`) VALUES(?)', [fl]);
            console.log('upload', w);

            cb();

        } catch (error) {
            console.log('upload error', error.message)
        }


    });

    socket.on('minta:file', async (cb) => {

        try {

            conn.query('SELECT `file` FROM emp WHERE `file` IS NOT NULL LIMIT 1', function (err, res) {
                console.log(res);
                var fl = res[0].file;

                cb(fl);
            })

        } catch (error) {
            console.log('upload error', error.message)
        }

    })
})

const rtc = io.of('/rtc');
var decr;

rtc.on('connect', (socket) => {

    socket.on('kirim', (d) => {
        //console.log('kirim');

        socket.broadcast.emit('terima', d)
    })

    socket.on('candidate:kirim', (c) => {
        socket.broadcast.emit('candidate:call', c)
    })

    socket.on('candidate:terima', (c) => {
        socket.broadcast.emit('candidate:answer', c)
    })

    socket.on('sudah', (d) => {
        //console.log('sudah');

        socket.broadcast.emit('udah', d);
    })
})

app.get('/', async (req, res) => {
    var h = req.get('host').split(':');
    var fl = await FS.readFileSync(PATH.join(__dirname, 'src/rtc.html'));

    res.setHeader('content-type', 'text/html');

    var svr = `https://${h[0]}/`;

    return res.status(200).send(fl.toString().replace(new RegExp('{{web}}', 'g'), svr));
});

app.get('/call', async (req, res) => {

    return res.status(200).sendFile(PATH.join(__dirname, 'src/pages/rtc/call.html'));
});


app.get('/jwb', async (req, res) => {

    return res.status(200).sendFile(PATH.join(__dirname, 'src/pages/rtc/answer.html'));
});

//const east = require('./lib/easyrtc_server');

server.listen(PORT, () => {
    console.log('Jalan', PORT);
})