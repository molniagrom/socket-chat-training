import './App.css'
import {useEffect, useRef, useState} from "react";
import {createConnection, destroyConnection, setClientMessage, setClientName} from "./state/chat-reducer.ts";
import {useAppDispatch, useAppSelector} from "./state/hooks.ts";

// https://my-socket-chat-training-server.onrender.com/
// Общедоступный сервер

// Подключаемся к нашему локальному серверу
// const socket: Socket = io("https://my-socket-chat-training-server.onrender.com");

function App() {
    console.log("app")
    // const [messages, setMessages] = useState<MessageType[]>([]);
    const [name, setName] = useState("Alina");
    const [newMessage, setNewMessage] = useState('');
    const [isAutoScrollActive, setIsAutoScrollActive] = useState(true);
    const [lastScrollTop, setLastScrollTop] = useState(0);

    const messages = useAppSelector((state) => state.chat.messages)
    const dispatch = useAppDispatch()
    console.log(messages)

    useEffect(() => {
        dispatch(createConnection());
        return () => {
            dispatch(destroyConnection())
        }
    }, []);

    useEffect(() => {
        if (isAutoScrollActive) {
            messagesAnchorRef.current?.scrollIntoView({behavior: 'smooth'});
        }
    }, [messages, isAutoScrollActive]);

    const sendMessage = () => {
        if (newMessage.trim() !== '') {
            console.log('Client sending message:', newMessage);
            dispatch(setClientMessage(newMessage));
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
                        dispatch(setClientName(name));
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
