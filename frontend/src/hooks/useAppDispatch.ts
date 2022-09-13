import { useDispatch } from 'react-redux'

import type { AppDispatch } from '../store'

/**
 * @see https://react-redux.js.org/using-react-redux/usage-with-typescript#typing-the-usedispatch-hook
 */
export const useAppDispatch: () => AppDispatch = useDispatch
