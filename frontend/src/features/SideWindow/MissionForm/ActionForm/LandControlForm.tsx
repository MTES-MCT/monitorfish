import {
  Checkbox,
  FormikCheckbox,
  FormikDatePicker,
  FormikEffect,
  FormikTextarea,
  FormikTextInput,
  Icon,
  Select
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'

import { PORTS_AS_OPTION } from './shared/constants'
import { ControlQualityField } from './shared/ControlQualityField'
import { FleetSegmentsField } from './shared/FleetSegmentsField'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { GearsField } from './shared/GearsField'
import { LicencesAndLogbookField } from './shared/LicencesAndLogbookField'
import { SpeciesField } from './shared/SpeciesField'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FieldGroup } from '../FieldGroup'
import { FieldsetGroup } from '../FieldsetGroup'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

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

          {/* TODO Update that once it's included in the API data. */}
          <Select
            // <FormikSelect
            baseContainer={newWindowContainerRef.current}
            isLight
            label="Lieu du contrôle"
            name="port"
            options={PORTS_AS_OPTION}
          />

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

          <FleetSegmentsField label="Segment de flotte" />

          <ControlQualityField />

          <FormikTextInput isLight label="Saisi par" name="userTrigram" />
        </FormBody>
      </>
    </Formik>
  )
}
