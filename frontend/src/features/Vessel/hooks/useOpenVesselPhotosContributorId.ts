import {
  getOpenVesselPhotosContributorId,
  IS_OPEN_VESSEL_PHOTOS_SUBMISSIONS_TRACKING_ENABLED
} from '@features/Vessel/openVesselPhotosApi'
import { useEffect, useState } from 'react'

import { useGetUserEmail } from '../../../auth/hooks/useGetUserEmail'

type ComputedContributorId = {
  contributorId: string
  email: string
}

/** Undefined while computed, or when the reviews of the photos sent can't be followed. */
export function useOpenVesselPhotosContributorId(): string | undefined {
  const email = useGetUserEmail()
  const [computed, setComputed] = useState<ComputedContributorId | undefined>(undefined)
  const isEnabled = IS_OPEN_VESSEL_PHOTOS_SUBMISSIONS_TRACKING_ENABLED && !!email

  useEffect(() => {
    if (!isEnabled) {
      return undefined
    }

    let isCancelled = false
    getOpenVesselPhotosContributorId(email)
      .then(contributorId => {
        if (!isCancelled) {
          setComputed({ contributorId, email })
        }
      })
      .catch(() => undefined)

    return () => {
      isCancelled = true
    }
  }, [email, isEnabled])

  return isEnabled && computed?.email === email ? computed.contributorId : undefined
}
