import './App.css'
import {useEffect, useState} from "react";
import {io, Socket} from "socket.io-client"

// Типизируем объекты для большей надежности
type UserType = {
    id: string;
    name: string;
}

type MessageType = {
    id: string;
    message: string;
    user: UserType;
}

// Подключаемся к нашему локальному серверу
const socket: Socket = io("http://localhost:3001");

function App() {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        // Слушаем событие 'server-message-sent' от сервера
        const messageListener = (message: MessageType) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };
        socket.on('server-message-sent', messageListener);

        // Очистка при размонтировании компонента
        return () => {
            socket.off('server-message-sent', messageListener);
        }
    }, []);

    const sendMessage = () => {
        if (newMessage.trim() !== '') {
            // Отправляем событие 'client-message-sent' на сервер
            socket.emit('client-message-sent', {
                id: new Date().getTime().toString(), // Простой генератор ID
                message: newMessage,
                user: {id: socket.id, name: 'You'} // Используем ID сокета как ID юзера
            });
            setNewMessage('');
        }
    };

    return (
        <div className="App">
            <div className={"container"}>
                <div className="messages-container">
                    {messages.map(m => {
                        return (
                            <div key={m.id}>
                                <b>{m.user.name}:</b> {m.message}
                                <hr/>
                            </div>
                        )
                    })}
                </div>
                <div className={"inputButton"}>
                    <textarea
                        className={"textarea"}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.currentTarget.value)}
                    ></textarea>
                    <button onClick={sendMessage}>Send</button>
                </div>
            </div>


        </div>
    )
}

export default App
