// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useSelector } from 'react-redux'

import type { MainRootState } from '../store'
import type { TypedUseSelectorHook } from 'react-redux'

/**
 * @see https://react-redux.js.org/using-react-redux/usage-with-typescript#typing-the-useselector-hook
 */
export const useMainAppSelector: TypedUseSelectorHook<MainRootState> = useSelector
