import { backofficeReducers, homeReducers } from './domain/reducers'
import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'

const homeStore = configureStore({
  reducer: homeReducers,
  middleware: [thunk]
})

const backofficeStore = configureStore({
  reducer: backofficeReducers,
  middleware: [thunk]
})

export { homeStore, backofficeStore }
