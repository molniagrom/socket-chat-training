import {useDispatch, useSelector, type TypedUseSelectorHook} from 'react-redux'
import type {RootState, AppDispatch} from './store'

// Используйте эти хуки вместо стандартных useDispatch и useSelector
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector