import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from "socket.io";

const app = express();
app.use(cors()); // Разрешаем CORS-запросы

// Добавим обработчик для корневого маршрута, чтобы избежать ошибки "Cannot GET /"
app.get('/', (req, res) => {
    res.send('Socket.IO Server is running. Open the client application to connect.');
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // URL вашего React-приложения (стандартный для Vite)
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('client-message-sent', (message) => {
        console.log('Message received:', message);
        // Пересылаем сообщение всем подключенным клиентам, включая отправителя
        io.emit('server-message-sent', message);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = 3001; // Выбираем порт для сервера
server.listen(PORT, () => {
    console.log(`Socket.IO server running at http://localhost:${PORT}/`);
});