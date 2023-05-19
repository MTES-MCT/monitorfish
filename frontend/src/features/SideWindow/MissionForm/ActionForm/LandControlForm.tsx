import {
  FormikCheckbox,
  FormikDatePicker,
  FormikEffect,
  FormikTextarea,
  FormikTextInput,
  Icon,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { ControlQualityField } from './shared/ControlQualityField'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikPortSelect } from './shared/FormikPortSelect'
import { GearsField } from './shared/GearsField'
import { LicencesAndLogbookField } from './shared/LicencesAndLogbookField'
import { SpeciesField } from './shared/SpeciesField'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { VesselFleetSegmentsField } from './shared/VesselFleetSegmentsField'
import { missionActions } from '../../../../domain/actions'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'

export type LandControlFormProps = {
  index: number
  initialValues: MissionActionFormValues
}
export function LandControlForm({ index, initialValues }: LandControlFormProps) {
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
    <Formik key={key} initialValues={initialValues} onSubmit={noop}>
      <>
        <FormikEffect onChange={handleChange as any} />

        <FormHead>
          <h2>
            <Icon.Anchor />
            Contrôle à la débarque ({titleDate})
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

          <FormikPortSelect />

          <LicencesAndLogbookField />

          <GearsField />

          <SpeciesField controlledWeightLabel="Qté pesée" />

          <FieldsetGroup isLight legend="Appréhension du navire">
            <FormikCheckbox label="Appréhension du navire" name="seizureAndDiversion" />
          </FieldsetGroup>

          <FormikMultiInfractionPicker
            addButtonLabel="Ajouter une autre infraction"
            label="Autres infractions"
            name="otherInfractions"
          />

          <FieldsetGroup isLight legend="Autres observations">
            <FormikTextarea isLabelHidden label="Autres observations" name="otherComments" />
          </FieldsetGroup>

          <hr />

          <VesselFleetSegmentsField label="Segment de flotte" />

          <ControlQualityField />

          <FormikTextInput isLight label="Saisi par" name="userTrigram" />
        </FormBody>
      </>
    </Formik>
  )
}
