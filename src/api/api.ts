import {io, Socket} from "socket.io-client";
import type {MessageType} from "../UserType.tsx";

export const socket: Socket = io("http://localhost:3001");

export const api = {
    socket: null as null | Socket,
    createConnection() {
        this.socket = io("http://localhost:3001");
    },

    destroyConnection() {
        this.socket?.disconnect();
        this.socket = null;
    },

    subscribe(initialMessagesListener: (messages: MessageType[]) => void, messageListener: (message: MessageType) => void) {
        this.socket?.on('new-message-sent', messageListener);
        this.socket?.on('initial-messages', initialMessagesListener);
    },

    sendName(name: string) {
        this.socket?.emit('client-name-sent', name);
    },
    sendMessage(message: string) {
        this.socket?.emit('client-message-sent', message);
    },
}