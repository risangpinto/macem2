/*const rtsp = require('rtsp-client');

// Buat koneksi dengan DVR
const client = new rtsp.Client({
    address: '192.168.2.162',
    port: 554,
    username: 'admin',
    password: '',
    stream: 'main',
});

// Tampilkan stream video di browser
client.on('data', (data) => {
    console.log(data);
});

client.on('error', (error) => {
    console.error(error);
});

client.start();*/

var
    http = require('http'),
    Cam = require('onvif').Cam;

new Cam({
    hostname: '192.168.2.162',
    username: 'admin',
    password: ''
}, function (err) {
    // this.absoluteMove({ x: 1, y: 1, zoom: 1 });
    this.getStreamUri({ protocol: 'RTSP' }, function (err, stream) {
        http.createServer(function (req, res) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<html><body>' +
                '<embed type="application/x-vlc-plugin" target="' + stream.uri + '"></embed>' +
                '</body></html>');
        }).listen(3030, function () {
            console.log('oke');
        });
    });
});