// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useSelector } from 'react-redux'

import type { MainRootState } from '../store'

/**
 * @see https://redux.js.org/usage/usage-with-typescript#withtypes
 */
export const useMainAppSelector = useSelector.withTypes<MainRootState>()
