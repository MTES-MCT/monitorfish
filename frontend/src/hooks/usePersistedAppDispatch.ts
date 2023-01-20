// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useDispatch } from 'react-redux'

import type { BackofficeAppDispatch } from '../store'

export const useBackofficeAppDispatch: () => BackofficeAppDispatch = useDispatch
