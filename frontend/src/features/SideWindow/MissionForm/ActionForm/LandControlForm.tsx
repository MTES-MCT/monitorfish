import {
  FormikCheckbox,
  FormikDatePicker,
  FormikEffect,
  FormikTextarea,
  FormikTextInput,
  Icon,
  useKey,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash/fp'
import { useMemo } from 'react'
import styled from 'styled-components'

import { LandControlFormClosureSchema, LandControlFormLiveSchema } from './schemas'
import { ControlQualityField } from './shared/ControlQualityField'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikPortSelect } from './shared/FormikPortSelect'
import { FormikRevalidationEffect } from './shared/FormikRevalidationEffect'
import { GearsField } from './shared/GearsField'
import { LicencesAndLogbookField } from './shared/LicencesAndLogbookField'
import { SpeciesField } from './shared/SpeciesField'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { VesselFleetSegmentsField } from './shared/VesselFleetSegmentsField'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'
import { FormikIsValidEffect } from '../shared/FormikIsValidEffect'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type LandControlFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}
export function LandControlForm({ initialValues, onChange }: LandControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const mission = useMainAppSelector(store => store.mission)

  // We have to re-create the Formik component when `validationSchema` changes to apply it
  const key = useKey([mission.isClosing])
  const titleDate = useMemo(
    () => initialValues.actionDatetimeUtc && getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )
  const validationSchema = useMemo(
    () => (mission.isClosing ? LandControlFormClosureSchema : LandControlFormLiveSchema),
    [mission.isClosing]
  )

  return (
    <Formik key={key} initialValues={initialValues} onSubmit={noop} validationSchema={validationSchema}>
      <>
        <FormikEffect onChange={onChange as any} />
        <FormikRevalidationEffect />
        <FormikIsValidEffect />

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

          <SeizureFieldsetGroup isLight legend="Appréhensions">
            <FormikCheckbox label="Appréhension d’engin(s)" name="hasSomeGearsSeized" />
            <FormikCheckbox label="Appréhension d’espèce(s)" name="hasSomeSpeciesSeized" />
            <FormikCheckbox label="Appréhension du navire" name="seizureAndDiversion" />
          </SeizureFieldsetGroup>

          <FormikMultiInfractionPicker
            addButtonLabel="Ajouter une autre infraction"
            infractionLabel="Autre infraction"
            label="Autres infractions"
            name="otherInfractions"
          />

          <FieldsetGroup isLight legend="Autres observations">
            <FormikTextarea isLabelHidden label="Autres observations" name="otherComments" rows={2} />
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

const SeizureFieldsetGroup = styled(FieldsetGroup)`
  > div {
    > .Field-Checkbox:not(:first-child) {
      margin-top: 16px;
    }
  }
`
