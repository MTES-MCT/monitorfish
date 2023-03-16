import {
  Checkbox,
  FormikCheckbox,
  FormikDatePicker,
  FormikEffect,
  FormikTextarea,
  FormikTextInput,
  Icon
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'

import { ControlQualityField } from './shared/ControlQualityField'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikPortSelect } from './shared/FormikPortSelect'
import { GearsField } from './shared/GearsField'
import { LicencesAndLogbookField } from './shared/LicencesAndLogbookField'
import { SpeciesField } from './shared/SpeciesField'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { VesselFleetSegmentsField } from './shared/VesselFleetSegmentsField'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FieldGroup } from '../shared/FieldGroup'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type LandControlFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}
export function LandControlForm({ initialValues, onChange }: LandControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const titleDate = useMemo(
    () => getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={noop}>
      <>
        <FormikEffect onChange={onChange as any} />

        <FormHead>
          <h2>
            <Icon.FishingEngine />
            Contrôle à la débarque ({titleDate})
          </h2>
        </FormHead>

        <FormBody>
          <FieldGroup isInline>
            <VesselField />
            <Checkbox label="Navire inconnu" name="isVesselUnknown" />
          </FieldGroup>

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

          <SpeciesField />

          <FieldsetGroup isLight legend="Appréhension et déroutement du navire">
            <FormikCheckbox label="Appréhension et déroutement du navire" name="seizureAndDiversion" />
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
