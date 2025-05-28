// Username of someone who is currently live
import { TikTokLiveConnection, WebcastEvent } from 'tiktok-live-connector';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as fs from 'fs';

const tiktokUsername = 'cc_wen';

const connection = new TikTokLiveConnection(tiktokUsername);

connection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
});

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

// Start the HTTP server on port 3000
httpServer.listen(3000, () => {
    console.log('Socket.IO server running on port 3000');
});

io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    socket.on('randomWord', (callback) => {
        console.log('Client requested a random word');
        const randomWord = Array.from(wordSet)[Math.floor(Math.random() * wordSet.size)];
        console.log(`Emitting random word: ${randomWord}`);
        callback(randomWord);
    });
});

let wordSet: Set<string> = new Set();

try {
    const fileContent = fs.readFileSync("./words.json", 'utf-8');
    const wordsObj = JSON.parse(fileContent);
    wordSet = new Set(Object.keys(wordsObj));
} catch (err) {
    console.error('Failed to load words.json:', err);
}

connection.on(WebcastEvent.CHAT, data => {
    if (data.user == null) return;
    console.log(`Received chat message from ${data.user.uniqueId}: ${data.comment}`);

    if (data.comment && wordSet.has(data.comment.toLowerCase())) {
        console.log(`Comment "${data.comment}" exists in words.json`);
        io.emit('wordSubmission', data);
    }
});