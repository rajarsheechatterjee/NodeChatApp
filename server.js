const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUSer, userLeave,  getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, '/public')));

const botName = 'ChatApp Bot';

io.on('connection', socket => {

    socket.on('joinroom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.emit('message', formatMessage(botName, 'Welcome to ChatApp!'));

        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `A ${user.username} has joined the chat!`));


        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on('chatMessage', (msg) => {
        const user = getCurrentUSer(socket.id);

        io.emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the chat`));
        }

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
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