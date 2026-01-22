import express from 'express';
import cors from 'cors';
import http from 'http';
import {Server} from "socket.io";

const messages = [
    {
        id: "1",
        message: "Hello everyone!",
        user: {id: "user1", name: "Alice"}
    },
    {
        id: "2",
        message: "Hi there!",
        user: {id: "user2", name: "Bob"}
    },
    {
        id: "3",
        message: "Alina is awesome!",
        user: {id: "user3", name: "Alex"}
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

const usersState = new Map()

io.on('connection', (socketChannel) => {

    usersState.set(socketChannel, {id: new Date().getTime().toString(), name: "anonym"})

    socketChannel.on('disconnect', () => {
        usersState.delete(socketChannel);
    })

    socketChannel.on("client-name-sent", (name) => {
        if (typeof name !== "string") {
            return
        }
        const user = usersState.get(socketChannel)
        user.name = name
    })

    socketChannel.on("user-typing", () => {
        socketChannel.broadcast.emit('user-typing', usersState.get(socketChannel));
    })

    // Отправляем историю сообщений новому пользователю
    socketChannel.emit('initial-messages', messages);

    socketChannel.on('client-message-sent', (newMessage, successFn) => {
        if (typeof newMessage !== "string" || newMessage.length > 20) {
            successFn("Message length should be less than 20 symbol")
            return
        }

        const user = usersState.get(socketChannel)

        const messageToSend = {
            id: new Date().getTime().toString(),
            message: newMessage,
            user: {id: user.id || 'unknown', name: user.name}
        };

        messages.push(messageToSend);
        // Пересылаем сообщение всем подключенным клиентам, включая отправителя
        io.emit('new-message-sent', messageToSend);
        successFn(null)

    });


});

// Используем порт, предоставленный хостингом, или 3001 для локальной разработки
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});