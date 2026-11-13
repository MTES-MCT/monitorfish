import { addListener, createListenerMiddleware } from '@reduxjs/toolkit'

import type { MainAppDispatch, MainRootState } from '@store'

export const mainListenerMiddleware = createListenerMiddleware()

/**
 * Dispatched by a component, it returns the function removing the listener, to call when the component unmounts.
 */
export const addMainAppListener = addListener.withTypes<MainRootState, MainAppDispatch>()
