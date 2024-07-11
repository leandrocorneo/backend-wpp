const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 5000;

const users = [];

io.on('connection', (socket) => {
    socket.on('disconnect', () => {
        const index = users.findIndex(user => user.id === socket.id);
        if (index !== -1) {
            const user = users.splice(index, 1)[0];
            io.to(user.room).emit('message', { name: null, message: `${user.name} saiu do chat`, room: user.room });
            io.to(user.room).emit('users', users.filter(u => u.room === user.room));
        }
    });

    socket.on('join', ({ roomName, userName }) => {
        const user = { id: socket.id, name: userName, room: roomName };
        socket.join(roomName);
        users.push(user);
        // io.to(roomName).emit('message', { name: null, message: `${userName} entrou no chat`, room: roomName });
        io.to(roomName).emit('users', users.filter(u => u.room === roomName));
    });

    socket.on('message', ({ roomName, message }) => {
        io.to(roomName).emit('message', { ...message, room: roomName });
    });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
