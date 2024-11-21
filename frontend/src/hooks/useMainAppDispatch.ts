// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useDispatch } from 'react-redux'

import type { MainAppDispatch } from '../store'

/**
 * @see https://redux.js.org/usage/usage-with-typescript#withtypes
 */
export const useMainAppDispatch = useDispatch.withTypes<MainAppDispatch>()
