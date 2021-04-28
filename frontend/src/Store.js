import reducer from './domain/reducers'
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

const store = configureStore({
  reducer: reducer,
  middleware: [thunk]
})

export default store
