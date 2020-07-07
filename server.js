const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, '/public')));

const botName = 'ChatApp Bot';

io.on('connection', socket => {

    socket.emit('message', formatMessage(botName, 'Welcome to ChatApp!'));

    socket.broadcast.emit('message', formatMessage(botName, 'A user has joined the chat!'));

    socket.on('disconnect', () => {
        io.emit('message', formatMessage(botName, 'A user has left the chat'));
    });

    socket.on('chatMessage', (msg) => {
        io.emit('message', formatMessage('USER', msg));
    });

});

app.get('/', (req, res) => (
    res.redirect('/index')
));

app.get('/index', (req, res) => (
    res.render('index')
));

app.get('/chat', (req, res) => (
    res.render('chat')
));

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));