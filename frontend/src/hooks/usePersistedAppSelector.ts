// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useSelector } from 'react-redux'

import type { PersistedRootState } from '../store'
import type { TypedUseSelectorHook } from 'react-redux'

export const usePersistedAppSelector: TypedUseSelectorHook<PersistedRootState> = useSelector
