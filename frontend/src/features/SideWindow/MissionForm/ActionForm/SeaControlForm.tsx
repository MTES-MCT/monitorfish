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
import { noop } from 'lodash/fp'
import { useMemo } from 'react'

import { getSeaControlFormSchema } from './schemas'
import { ControlQualityField } from './shared/ControlQualityField'
import { FormikCoordinatesPicker } from './shared/FormikCoordinatesPicker'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
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

import type { FormikFormError } from '../../../../types'
import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type SeaControlFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
  onError: (nextFormError: FormikFormError) => Promisable<void>
}
export function SeaControlForm({ initialValues, onChange, onError }: SeaControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const { draft } = useMainAppSelector(store => store.mission)

  const titleDate = useMemo(
    () => initialValues.actionDatetimeUtc && getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )

  // TODO Fix the validation: it can't be used as the formik state is inconsistent (due to FormikEffect ?)
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={noop}
      validationSchema={getSeaControlFormSchema(draft?.mainFormValues?.isClosed)}
    >
      <>
        <FormikEffect onChange={onChange as any} onError={onError} />
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

          <FieldsetGroup isLight legend="Appréhension et déroutement du navire">
            <FormikCheckbox label="Appréhension et déroutement du navire" name="seizureAndDiversion" />
          </FieldsetGroup>

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
