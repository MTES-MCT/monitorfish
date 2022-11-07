// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useSelector } from 'react-redux'

import type { BakcofficeRootState, HomeRootState } from '../store'
import type { TypedUseSelectorHook } from 'react-redux'

/**
 * @see https://react-redux.js.org/using-react-redux/usage-with-typescript#typing-the-useselector-hook
 */
export const useAppSelector: TypedUseSelectorHook<HomeRootState> = useSelector

// TODO We should find another way than having 2 stores.
// This doesn't work and is unusable but left for the sake of the above todo
export const useBackofficeAppSelector: TypedUseSelectorHook<BakcofficeRootState> = useSelector
