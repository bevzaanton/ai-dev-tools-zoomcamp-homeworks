const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Store connected users
const users = new Map();

// Random name generator
const adjectives = ['Quick', 'Clever', 'Bright', 'Swift', 'Bold', 'Wise', 'Calm', 'Brave', 'Sharp', 'Cool'];
const nouns = ['Panda', 'Tiger', 'Eagle', 'Dolphin', 'Fox', 'Wolf', 'Hawk', 'Lion', 'Bear', 'Owl'];
const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];

function generateRandomName() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

io.on('connection', (socket) => {
    const userName = generateRandomName();
    const userColor = getRandomColor();

    users.set(socket.id, { name: userName, color: userColor });
    console.log('User connected:', socket.id, '-', userName);

    // Send current user info to the newly connected client
    socket.emit('user-info', { id: socket.id, name: userName, color: userColor });

    // Broadcast updated user list to all clients
    io.emit('users-update', Array.from(users.entries()).map(([id, user]) => ({
        id,
        name: user.name,
        color: user.color
    })));

    socket.on('code-change', (code) => {
        console.log('Received code-change from', socket.id, '- broadcasting to others');
        socket.broadcast.emit('code-update', code);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id, '-', users.get(socket.id)?.name);
        users.delete(socket.id);

        // Broadcast updated user list to all remaining clients
        io.emit('users-update', Array.from(users.entries()).map(([id, user]) => ({
            id,
            name: user.name,
            color: user.color
        })));
    });
});

// Serve index.html for all other routes (SPA support)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
