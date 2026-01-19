import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from "socket.io";

const messages = [
    {
        id: "1",
        message: "Hello everyone!",
        user: { id: "user1", name: "Alice" }
    },
    {
        id: "2",
        message: "Hi there!",
        user: { id: "user2", name: "Bob" }
    },
    {
        id: "3",
        message: "Alina is awesome!",
        user: { id: "user3", name: "Alex" }
    },
];

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
    // Отправляем историю сообщений новому пользователю
    socket.emit('initial-messages', messages);

    socket.on('client-message-sent', (message) => {
        // Добавляем новое сообщение в массив на сервере
        messages.push(message);
        // Пересылаем сообщение всем подключенным клиентам, включая отправителя
        io.emit('new-message-sent', message);
    });

});

// Используем порт, предоставленный хостингом, или 3001 для локальной разработки
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});