import { useMainAppSelector } from '@hooks/useMainAppSelector'
import {
  FormikCheckbox,
  FormikDatePicker,
  FormikEffect,
  FormikTextarea,
  Icon,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash/fp'
import { useMemo } from 'react'
import styled from 'styled-components'

import { SeaControlFormClosureSchema, SeaControlFormLiveSchema } from './schemas'
import { ControlQualityField } from './shared/ControlQualityField'
import { FormikAuthor } from './shared/FormikAuthor'
import { FormikCoordinatesPicker } from './shared/FormikCoordinatesPicker'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikOtherControlsCheckboxes } from './shared/FormikOtherControlsCheckboxes'
import { FormikRevalidationEffect } from './shared/FormikRevalidationEffect'
import { GearsField } from './shared/GearsField'
import { LicencesAndLogbookField } from './shared/LicencesAndLogbookField'
import { SpeciesField } from './shared/SpeciesField'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { VesselFleetSegmentsField } from './shared/VesselFleetSegmentsField'
import { validateBeforeOnChange } from './utils'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type SeaControlFormProps = Readonly<{
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}>
export function SeaControlForm({ initialValues, onChange }: SeaControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const isClosing = useMainAppSelector(store => store.missionForm.isClosing)

  const titleDate = useMemo(
    () => initialValues.actionDatetimeUtc && getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )
  const validationSchema = useMemo(
    () => (isClosing ? SeaControlFormClosureSchema : SeaControlFormLiveSchema),
    [isClosing]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={noop} validationSchema={validationSchema}>
      {({ validateForm }) => (
        <>
          <FormikEffect onChange={validateBeforeOnChange(initialValues, validateForm, onChange)} />
          <FormikRevalidationEffect />

          <FormHead>
            <h2>
              <Icon.FleetSegment />
              Contrôle en mer ({titleDate})
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

            <LicencesAndLogbookField />

            <GearsField />

            <SpeciesField controlledWeightLabel="Qté estimée" />

            <SeizureFieldsetGroup isLight legend="Appréhension et déroutement">
              <FormikCheckbox label="Appréhension d’engin(s)" name="hasSomeGearsSeized" />
              <FormikCheckbox label="Appréhension d’espèce(s)" name="hasSomeSpeciesSeized" />
              <FormikCheckbox label="Appréhension et déroutement du navire" name="seizureAndDiversion" />
            </SeizureFieldsetGroup>

            <FormikMultiInfractionPicker addButtonLabel="Ajouter une infraction" label="Infractions" />

            <FieldsetGroup isLight legend="Autres observations">
              <FormikTextarea isLabelHidden label="Autres observations" name="otherComments" rows={2} />
            </FieldsetGroup>

            <hr />

            <VesselFleetSegmentsField label="Segment de flotte" />

            <ControlQualityField />

            <FormikOtherControlsCheckboxes />

            <FormikAuthor />
          </FormBody>
        </>
      )}
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
