import { FormikEffect, FormikTextarea, FormikTextInput, Icon } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useEffect, useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { getTitleDateFromUtcStringDate } from './shared/utils'
import { missionActions } from '../../../../domain/actions'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'

export type ObservationFormProps = {
  index: number
  initialValues: MissionActionFormValues
}
export function ObservationForm({ index, initialValues }: ObservationFormProps) {
  const { mission } = useMainAppSelector(store => store)
  const dispatch = useMainAppDispatch()

  const key = useMemo(() => JSON.stringify(initialValues), [initialValues])
  const titleDate = useMemo(
    () => initialValues.actionDatetimeUtc && getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )

  const handleChange = useDebouncedCallback((nextMissionActionFormValues: MissionActionFormValues) => {
    // Since it's debounced, we don't want to update this draft action which could have just been deleted
    if (!mission.draft || !mission.draft.actions[index]) {
      return
    }

    dispatch(
      missionActions.setDraftAction({
        index,
        nextAction: nextMissionActionFormValues
      })
    )
  }, 500)

  useEffect(
    () => () => {
      handleChange.cancel()
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <Formik key={key} initialValues={initialValues} onSubmit={noop}>
      <>
        <FormikEffect onChange={handleChange as any} />

        <FormHead>
          <h2>
            <Icon.Note />
            Note libre ({titleDate})
          </h2>
        </FormHead>

        <FormBody>
          <FormikTextarea isLight label="Observations, commentaires..." name="otherComments" />

          <FormikTextInput isLight label="Saisi par" name="userTrigram" />
        </FormBody>
      </>
    </Formik>
  )
}
