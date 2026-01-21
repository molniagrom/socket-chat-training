import {configureStore} from '@reduxjs/toolkit'
import chatReducer from './chat-reducer'

// Создаем Redux store
export const store = configureStore({
    reducer: {
        chat: chatReducer,
    },
})

// Типизация для всего состояния приложения
export type RootState = ReturnType<typeof store.getState>
// Типизация для dispatch с поддержкой thunk
export type AppDispatch = typeof store.dispatch