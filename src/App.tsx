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

        const initialMessagesListener = (messages: MessageType[]) => {
            setMessages(messages);
        };
        socket.on('initial-messages', initialMessagesListener);

        // Очистка при размонтировании компонента
        return () => {
            console.log('Cleaning up socket listeners...');
            socket.off('server-message-sent', messageListener);
            socket.off('initial-messages', initialMessagesListener);
            socket.off('connect');
            socket.off('connect_error');
        }
    }, []);

    const sendMessage = () => {
        if (newMessage.trim() !== '') {
            const messageToSend = {
                id: new Date().getTime().toString(),
                message: newMessage,
                user: {id: socket.id || 'unknown', name: 'You'}
            };
            
            // Отправляем событие 'client-message-sent' на сервер
            socket.emit('client-message-sent', messageToSend);
            setNewMessage('');
        } else {
            console.log('Empty message, not sending');
        }
    };

    return (
        <div className="App">
            <div className={"container"}>
                <div className="messages-container">
                    {messages.length === 0 && <div>No messages yet...</div>}
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
