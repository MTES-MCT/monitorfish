import {
  FormikCheckbox,
  FormikEffect,
  FormikMultiSelect,
  FormikNumberInput,
  FormikTextarea,
  FormikTextInput,
  Icon,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { FLIGHT_GOALS_AS_OPTIONS } from './shared/constants'
import { FleetSegmentsField } from './shared/FleetSegmentsField'
import { missionActions } from '../../../../domain/actions'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'

export type AirSurveillanceFormProps = {
  index: number
  initialValues: MissionActionFormValues
}
export function AirSurveillanceForm({ index, initialValues }: AirSurveillanceFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const { mission } = useMainAppSelector(store => store)
  const dispatch = useMainAppDispatch()

  const key = useMemo(() => JSON.stringify(initialValues), [initialValues])

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
    <Formik key={key} initialValues={initialValues} onSubmit={noop}>
      <>
        <FormikEffect onChange={handleChange as any} />

        <FormHead>
          <h2>
            <Icon.Observation />
            Surveillance aérienne
          </h2>
        </FormHead>

        <FormBody>
          <FormikMultiSelect
            baseContainer={newWindowContainerRef.current}
            isLight
            label="Objectifs du vol"
            name="flightGoals"
            options={FLIGHT_GOALS_AS_OPTIONS}
          />

          <FleetSegmentsField label="Segments ciblés" />

          <FormikNumberInput isLight label="Nb de navires survolés" name="numberOfVesselsFlownOver" />

          <FormikTextarea isLight label="Observations générales sur le vol" name="otherComments" />

          <hr />

          <FieldsetGroup isLight legend="Qualité du contrôle">
            <FormikTextarea
              label="Observations sur le déroulé de la surveillance"
              name="controlQualityComments"
              placeholder="Éléments marquants dans vos échanges avec l’unité, problèmes rencontrés..."
            />
            <FormikCheckbox label="Fiche RETEX nécessaire" name="feedbackSheetRequired" />
          </FieldsetGroup>

          <FormikTextInput isLight label="Saisi par" name="userTrigram" />
        </FormBody>
      </>
    </Formik>
  )
}
