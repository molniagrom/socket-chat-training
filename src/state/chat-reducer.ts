import {createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";
import {api} from "../api/api.ts";
import type {UserType, MessageType} from "../UserType.tsx";

interface ChatState {
    messages: MessageType[];
    typingUsers: UserType[];
}

const initialState: ChatState = {
    messages: [],
    typingUsers: [],
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
            // Убираем пользователя из списка печатающих когда приходит сообщение
            state.typingUsers = state.typingUsers.filter(
                u => u.id !== action.payload.user.id
            );
        },
        typingUserAdded: (state, action: PayloadAction<UserType>) => {
            // Удаляем пользователя если он уже есть, затем добавляем в конец
            state.typingUsers = [
                ...state.typingUsers.filter(u => u.id !== action.payload.id), 
                action.payload
            ];
        },
        typingUserRemoved: (state, action: PayloadAction<string>) => {
            state.typingUsers = state.typingUsers.filter(u => u.id !== action.payload);
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
        },
        (user: UserType) => {
            dispatch(typingUserAdded(user));
        }
    )
}

export const destroyConnection = () => () => {
    api.destroyConnection()
}
export const setClientName = (name: string) => () => {
    api.sendName(name)
}
export const setClientMessage = (message: string) => () => {
    api.sendMessage(message);
}
export const typeMessage = () => () => {
    api.typeMessage();
}

// Export action creators
export const {messagesReceived, newMessagesReceived, typingUserAdded, typingUserRemoved} = chatSlice.actions;
export default chatSlice.reducer;
