const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");

const session = require("express-session");
const PATH = require('path');

var sessi = session({
    secret: 'RISANGMYID',
    resave: true,
    saveUninitialized: true,
    name: 'risang.my.id',
    cookie: {}
});

app.use(sessi);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/src', express.static('src'));

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
const io = new Server(server);
const risang = io.of('/risang');


io.use(wrap(sessi));
risang.use(wrap(sessi));

// get the client
const mysql = require('mysql2/promise');



class Olah {
    db;

    constructor() {
        this.connect();
    }

    async connect() {

        this.db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            database: 'risang.my.id'
        })

        //this.db.on()

    }

    async addProject(dt) {

        try {
            var [res] = await this.db.execute('INSERT INTO project_data(nama) VALUES (?)', [dt.nama]);

            return { oke: true, insertId: res.insertId }
        } catch (error) {
            return { oke: false, message: error.message }

        }


    }

    async listProject() {

        try {

            var [r, f] = await this.db.query('SELECT * FROM project_data');

            return r;

        } catch (error) {

            console.log(error.message);
            return [];
        }

    }

}

const olah = new Olah();

risang.use((socket, next) => {
    const sessi = socket.request.session;

    if (!sessi.valid) {
        return next(new Error('Harus Login'));

    }

    //console.log('user Admin', socket.id, sessi);
    next();
})

io.on('connect', async (socket) => {

    socket.on('user:req:login', (dt, cb) => {
        //console.log(dt);
        socket.request.session.reload(err => {
            //console.log('error', err);

            socket.request.session.valid = true;
            socket.request.session.save();
        })

        cb(true);
    });


});

risang.on('connect', async (socket) => {


    socket.on('project:add', async (dt, cb) => {
        console.log('s', dt)
        var r = await olah.addProject(dt);

        cb(r);
    });

    socket.on('project:list', async (cb) => {
        var r = await olah.listProject();

        cb(r);
    })
});

app.get('/project', async (req, res) => {

    var sessi = req.session.valid;

    //console.log('sessi', req.session);
    var fl = 'login.html';

    if (sessi) {
        var fl = 'index.html';
    }

    res.status(200).sendFile(PATH.join(__dirname, 'src', 'risang', fl))

})

server.listen(8080, () => { console.log('jalan 8080') });