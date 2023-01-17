/**
 * @see https://stackoverflow.com/a/65637156/2736233
 */

import 'redux-persist'

import type { AnyAction } from '@reduxjs/toolkit'

declare module 'redux-persist/es/persistReducer' {
  // eslint-disable-next-line import/no-default-export
  export default function persistReducer<S, A extends AnyAction>(
    config: PersistConfig<S>,
    baseReducer: Reducer<S, A>
  ): Reducer<S & PersistPartial, A>
}
