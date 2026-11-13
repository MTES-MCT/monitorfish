import { addListener, createListenerMiddleware } from '@reduxjs/toolkit'

import type { MainAppDispatch, MainRootState } from '@store'

export const mainListenerMiddleware = createListenerMiddleware()

export const addMainAppListener = addListener.withTypes<MainRootState, MainAppDispatch>()
