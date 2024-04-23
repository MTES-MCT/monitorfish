import { createSlice } from '@reduxjs/toolkit'

export function createGenericSlice(initialState, reducers, topic) {
  const initialStateCopy = { ...initialState }
  const reducersCopy = { ...reducers }
  const sliceObject = {
    initialState: initialStateCopy,
    name: topic,
    reducers: reducersCopy
  }

  return createSlice(sliceObject)
}
