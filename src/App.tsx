import './App.css'
import {useEffect, useRef, useState} from "react";
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

// https://my-socket-chat-training-server.onrender.com/
// Общедоступный сервер

// Подключаемся к нашему локальному серверу
const socket: Socket = io("http://localhost:3001");

// const socket: Socket = io("https://my-socket-chat-training-server.onrender.com");

function App() {
    console.log("app")
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [name, setName] = useState("Alina");
    const [newMessage, setNewMessage] = useState('');
    const [isAutoScrollActive, setIsAutoScrollActive] = useState(true);
    const [lastScrollTop, setLastScrollTop] = useState(0);

    useEffect(() => {

        // Слушаем событие 'server-message-sent' от сервера
        const messageListener = (message: MessageType) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };
        socket.on('new-message-sent', messageListener);

        const initialMessagesListener = (messages: MessageType[]) => {
            setMessages(messages);
        };
        socket.on('initial-messages', initialMessagesListener);

        // Очистка при размонтировании компонента
        return () => {
            console.log('Cleaning up socket listeners...');
            socket.off('new-message-sent', messageListener);
            socket.off('initial-messages', initialMessagesListener);
            socket.off('connect');
            socket.off('connect_error');
        }
    }, []);

    useEffect(() => {
        if (isAutoScrollActive) {
            messagesAnchorRef.current?.scrollIntoView({behavior: 'smooth'});
        }
    }, [messages, isAutoScrollActive]);

    const sendMessage = () => {
        if (newMessage.trim() !== '') {

            // Отправляем событие 'client-message-sent' на сервер
            socket.emit('client-message-sent', newMessage);
            setNewMessage('');
        } else {
            console.log('Empty message, not sending');
        }
    }

    const messagesAnchorRef = useRef<HTMLDivElement>(null)

    return (
        <div className="App">
            <div className={"container"}>
                <div className="messages-container" onScroll={(e) => {

                    const element = e.currentTarget;
                    const maxScrollPosition = element.scrollHeight - element.clientHeight
                    console.log(maxScrollPosition)

                    if (element.scrollTop > lastScrollTop && Math.abs(maxScrollPosition - element.scrollTop) < 10) {
                        setIsAutoScrollActive(true)
                    } else {
                        setIsAutoScrollActive(false)
                    }
                    setLastScrollTop(element.scrollTop)

                }}>
                    {messages.length === 0 && <div>No messages yet...</div>}
                    {messages.map(m => {
                        return (
                            <div key={m.id}>
                                <b>{m.user.name}:</b> {m.message}
                                <hr/>
                            </div>
                        )
                    })}
                    <div ref={messagesAnchorRef}></div>
                </div>
                <br/>
                <div className={"inputButton"}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button onClick={() => {
                        socket.emit('client-name-sent', name)
                    }}>send name
                    </button>
                </div>
                <br/>
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
