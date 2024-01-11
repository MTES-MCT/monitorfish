import { diff } from 'deep-object-diff'
import { useFormikContext } from 'formik'
import { omit } from 'lodash'
import { useEffect, useState } from 'react'

import { useDeepCompareEffect } from '../../../../hooks/useDeepCompareEffect'
import { EVENT_SOURCE, MISSION_UPDATE_EVENT, missionEventListener } from '../sse'

import type { MissionMainFormValues } from '../types'

type FormikSyncMissionFormProps = {
  missionId: number | undefined
}
/**
 * Sync
 */
export function FormikSyncMissionFields({ missionId }: FormikSyncMissionFormProps) {
  const { setFieldValue, values } = useFormikContext<MissionMainFormValues>()
  const [receivedMission, setReceivedMission] = useState<MissionMainFormValues | undefined>()

  useEffect(() => {
    if (!missionId) {
      return undefined
    }

    const listener = missionEventListener(missionId, mission => setReceivedMission(mission))

    EVENT_SOURCE.addEventListener(MISSION_UPDATE_EVENT, listener)

    return () => {
      EVENT_SOURCE.removeEventListener(MISSION_UPDATE_EVENT, listener)
    }
  }, [missionId])

  useDeepCompareEffect(
    () => {
      if (!receivedMission) {
        return
      }

      ;(async () => {
        const receivedDiff = diff(omit(values, ['isValid']), receivedMission)

        /**
         * We iterate and use `setFieldValue` on each diff key to avoid a global re-render of the <MainForm/> component
         */
        Object.keys(receivedDiff).forEach(key => {
          // eslint-disable-next-line no-console
          console.log(`SSE: setting form key "${key}" to "${receivedMission[key]}"`)
          setFieldValue(key, receivedMission[key])
        })
      })()
    },

    // We don't want to trigger infinite re-renders since `setFieldValue` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [receivedMission]
  )

  return <></>
}
