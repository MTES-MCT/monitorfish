import { diff } from 'deep-object-diff'
import { useFormikContext } from 'formik'
import { omit } from 'lodash'

import { useDeepCompareEffect } from '../../../../hooks/useDeepCompareEffect'
import { useListenMissionEventUpdatesById } from '../hooks/useListenMissionEventUpdatesById'
import { MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM } from '../sse'

import type { MissionMainFormValues } from '../types'

type FormikSyncMissionFormProps = {
  missionId: number | undefined
}
/**
 * Sync
 */
export function FormikSyncMissionFields({ missionId }: FormikSyncMissionFormProps) {
  const { setFieldValue, values } = useFormikContext<MissionMainFormValues>()
  const receivedMission = useListenMissionEventUpdatesById(missionId)

  useDeepCompareEffect(
    () => {
      if (!receivedMission) {
        return
      }

      ;(async () => {
        const receivedDiff = diff(
          omit(values, MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM),
          omit(receivedMission, MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM)
        )

        /**
         * We iterate and use `setFieldValue` on each diff key to avoid a global re-render of the <MainForm/> component
         */
        Object.keys(receivedDiff).forEach(key => {
          // eslint-disable-next-line no-console
          console.log(`SSE: setting form key "${key}" to ${JSON.stringify(receivedMission[key])}`)
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
