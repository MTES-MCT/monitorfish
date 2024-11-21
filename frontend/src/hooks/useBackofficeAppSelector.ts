// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useSelector } from 'react-redux'

import type { BackofficeRootState } from '../store'

export const useBackofficeAppSelector = useSelector.withTypes<BackofficeRootState>()
