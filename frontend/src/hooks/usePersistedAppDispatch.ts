// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useDispatch } from 'react-redux'

import type { PersistedAppDispatch } from '../store'

export const usePersistedAppDispatch: () => PersistedAppDispatch = useDispatch
