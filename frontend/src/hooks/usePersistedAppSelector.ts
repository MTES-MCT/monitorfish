// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useSelector } from 'react-redux'

import type { BackofficeRootState } from '../store'
import type { TypedUseSelectorHook } from 'react-redux'

export const useBackofficeAppSelector: TypedUseSelectorHook<BackofficeRootState> = useSelector
