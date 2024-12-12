// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useDispatch } from 'react-redux'

import type { HybridAppDispatch } from '@store/types'

/**
 * @see https://redux.js.org/usage/usage-with-typescript#withtypes
 */
// TODO Type this properly to handle hybrid dispatch-es without the need for `as unknown as UnknownAction`.
export const useHybridAppDispatch = useDispatch.withTypes<HybridAppDispatch>()
