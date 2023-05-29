import {
  FormikDatePicker,
  FormikEffect,
  FormikTextInput,
  FormikTextarea,
  Icon,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { AirControlFormSchema } from './schemas'
import { FormikCoordinatesPicker } from './shared/FormikCoordinatesPicker'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikRevalidationEffect } from './shared/FormikRevalidationEffect'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { missionActions } from '../../../../domain/actions'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'

export type AirControlFormProps = {
  index: number
  initialValues: MissionActionFormValues
}
export function AirControlForm({ index, initialValues }: AirControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

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

  return (
    <Formik key={key} initialValues={initialValues} onSubmit={noop} validationSchema={AirControlFormSchema}>
      <>
        <FormikEffect onChange={handleChange as any} />
        <FormikRevalidationEffect />

        <FormHead>
          <h2>
            <Icon.Plane />
            Contrôle aérien ({titleDate})
          </h2>
        </FormHead>

        <FormBody>
          <VesselField />

          <FormikDatePicker
            baseContainer={newWindowContainerRef.current}
            isLight
            isStringDate
            label="Date et heure du contrôle"
            name="actionDatetimeUtc"
            withTime
          />

          <FormikCoordinatesPicker />

          <FormikMultiInfractionPicker
            addButtonLabel="Ajouter une infraction"
            label="Infractions"
            name="otherInfractions"
          />

          <FieldsetGroup isLight legend="Autres observations">
            <FormikTextarea isLabelHidden label="Autres observations" name="otherComments" />
          </FieldsetGroup>

          <FormikTextInput isLight label="Saisi par" name="userTrigram" />
        </FormBody>
      </>
    </Formik>
  )
}
