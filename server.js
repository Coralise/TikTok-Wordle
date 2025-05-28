"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Username of someone who is currently live
var tiktok_live_connector_1 = require("tiktok-live-connector");
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var fs = require("fs");
var tiktokUsername = 'cc_wen';
var connection = new tiktok_live_connector_1.TikTokLiveConnection(tiktokUsername);
connection.connect().then(function (state) {
    console.info("Connected to roomId ".concat(state.roomId));
}).catch(function (err) {
    console.error('Failed to connect', err);
});
var httpServer = (0, http_1.createServer)();
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
    },
});
// Start the HTTP server on port 3000
httpServer.listen(3000, function () {
    console.log('Socket.IO server running on port 3000');
});
io.on('connection', function (socket) {
    console.log('A client connected:', socket.id);
    socket.on('randomWord', function (callback) {
        console.log('Client requested a random word');
        var randomWord = Array.from(wordSet)[Math.floor(Math.random() * wordSet.size)];
        console.log("Emitting random word: ".concat(randomWord));
        callback(randomWord);
    });
});
var wordSet = new Set();
try {
    var fileContent = fs.readFileSync("./words.json", 'utf-8');
    var wordsObj = JSON.parse(fileContent);
    wordSet = new Set(Object.keys(wordsObj));
}
catch (err) {
    console.error('Failed to load words.json:', err);
}
connection.on(tiktok_live_connector_1.WebcastEvent.CHAT, function (data) {
    if (data.user == null)
        return;
    console.log("Received chat message from ".concat(data.user.uniqueId, ": ").concat(data.comment));
    if (data.comment && wordSet.has(data.comment.toLowerCase())) {
        console.log("Comment \"".concat(data.comment, "\" exists in words.json"));
        io.emit('wordSubmission', data);
    }
});
