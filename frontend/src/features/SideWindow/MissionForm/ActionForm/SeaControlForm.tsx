import {
  FormikCheckbox,
  FormikDatePicker,
  FormikEffect,
  FormikTextarea,
  FormikTextInput,
  Icon,
  MultiZoneEditor
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { useMemo } from 'react'

import { ControlQualityField } from './shared/ControlQualityField'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { GearsField } from './shared/GearsField'
import { LicencesAndLogbookField } from './shared/LicencesAndLogbookField'
import { SpeciesField } from './shared/SpeciesField'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { VesselFleetSegmentsField } from './shared/VesselFleetSegmentsField'
import { useNewWindow } from '../../../../ui/NewWindow'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type SeaControlFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextMissionAction: MissionActionFormValues) => Promisable<void>
}
export function SeaControlForm({ initialValues, onChange }: SeaControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const titleDate = useMemo(
    () => getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={onChange as any}>
      <>
        <FormikEffect onChange={onChange as any} />

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

          {/* TODO Formik that in monitor-ui. */}
          <MultiZoneEditor
            addButtonLabel="Ajouter un point de contrôle"
            initialZone={{
              name: 'Nouvelle zone'
            }}
            label="Lieu du contrôle"
            labelPropName="name"
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

          <VesselFleetSegmentsField label="Segment de flotte" />

          <ControlQualityField />

          <FormikTextInput isLight label="Saisi par" name="userTrigram" />
        </FormBody>
      </>
    </Formik>
  )
}
