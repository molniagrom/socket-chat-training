import {createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import {api} from "../api/api.ts";

// Define message types
interface UserType {
    id: string;
    name: string;
}

interface MessageType {
    id: string;
    message: string;
    user: UserType;
}

interface ChatState {
    messages: MessageType[];
}

const initialState: ChatState = {
    messages: []
}

const chatSlice = createSlice({
    name: "chat",
    initialState: initialState,
    reducers: {
        messagesReceived: (state, action: PayloadAction<MessageType[]>) => {
            state.messages = action.payload;
        },
        newMessagesReceived: (state, action: PayloadAction<MessageType>) => {
            state.messages.push(action.payload);
        }
    }
});

// Connection functions
export const createConnection = () => (dispatch: any) => {
    api.createConnection()
    api.subscribe(
        (messages) => {
            console.log('Received initial messages:', messages);
            dispatch(messagesReceived(messages))
        },
        (message) => {
            console.log('Received new message:', message);
            dispatch(newMessagesReceived(message))
        }
    )
}

export const destroyConnection = () => (dispatch: any) => {
    api.destroyConnection()
}
export const setClientName = (name: string) => (dispatch: any) => {
    api.sendName(name)
}
export const setClientMessage = (message: string) => (dispatch: any) => {
    api.sendMessage(message);
}

// Export action creators
export const {messagesReceived, newMessagesReceived} = chatSlice.actions;
export default chatSlice.reducer;
