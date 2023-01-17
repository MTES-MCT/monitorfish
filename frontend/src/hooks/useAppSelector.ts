// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useSelector } from 'react-redux'

import type { RootState } from '../store'
import type { TypedUseSelectorHook } from 'react-redux'

/**
 * @see https://react-redux.js.org/using-react-redux/usage-with-typescript#typing-the-useselector-hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
