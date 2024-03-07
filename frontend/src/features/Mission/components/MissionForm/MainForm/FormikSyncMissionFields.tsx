import { logInDev } from '@utils/logInDev'
import { diff } from 'deep-object-diff'
import { useFormikContext } from 'formik'
import { omit } from 'lodash'
import { useEffect } from 'react'

import { useListenToMissionEventUpdatesById } from '../hooks/useListenToMissionEventUpdatesById'
import { MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM } from '../sse'

import type { MissionMainFormValues } from '../types'

type FormikSyncMissionFormProps = Readonly<{
  missionId: number | undefined
}>
/**
 * Sync
 */
export function FormikSyncMissionFields({ missionId }: FormikSyncMissionFormProps) {
  const { setFieldValue, values } = useFormikContext<MissionMainFormValues>()
  const missionEvent = useListenToMissionEventUpdatesById(missionId)

  useEffect(
    () => {
      if (!missionEvent) {
        return
      }

      const receivedDiff = diff(
        omit(values, MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM),
        omit(missionEvent, MISSION_EVENT_UNSYNCHRONIZED_PROPERTIES_IN_FORM)
      )

      /**
       * We iterate and use `setFieldValue` on each diff key to avoid a global re-render of the <MainForm/> component
       */
      Object.keys(receivedDiff).forEach(key => {
        logInDev(`SSE: setting form key "${key}" to ${JSON.stringify(missionEvent[key])}`)
        setFieldValue(key, missionEvent[key])
      })
    },

    // We don't want to trigger infinite re-renders since `setFieldValue` changes after each rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [missionEvent]
  )

  return <></>
}
