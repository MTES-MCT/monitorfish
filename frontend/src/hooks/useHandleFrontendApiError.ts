import { monitorfishApi } from '@api/api'
import { displayOrLogError } from 'domain/use_cases/error/displayOrLogError'
import { useEffect, useMemo } from 'react'

import { useMainAppDispatch } from './useMainAppDispatch'

import type { RtkCacheTagType } from '@api/constants'
import type { CustomRTKResponseError } from '@api/types'
import type { DisplayedErrorKey } from '@libs/DisplayedError/constants'
import type { FrontendApiError } from '@libs/FrontendApiError'
import type { SerializedError } from '@reduxjs/toolkit'
import type { MainAppThunk, MainAppUseCase } from '@store'

export function useHandleFrontendApiError(
  displayedErrorKey: DisplayedErrorKey,
  error: FrontendApiError | CustomRTKResponseError | SerializedError | undefined,
  rtkCacheTagType: RtkCacheTagType
) {
  const dispatch = useMainAppDispatch()
  const retryableUseCase: MainAppUseCase = useMemo(
    () => (): MainAppThunk => thunkDispatch => {
      thunkDispatch(monitorfishApi.util.invalidateTags([rtkCacheTagType]))
    },
    [rtkCacheTagType]
  )

  useEffect(() => {
    if (error) {
      dispatch(displayOrLogError(error, retryableUseCase, true, displayedErrorKey))
    }
  }, [dispatch, displayedErrorKey, error, retryableUseCase])
}
