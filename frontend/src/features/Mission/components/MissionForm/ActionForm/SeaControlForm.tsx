import { ActionFormHeader } from '@features/Mission/components/MissionForm/ActionForm/shared/ActionFormHeader'
import { DatePickerField } from '@features/Mission/components/MissionForm/ActionForm/shared/DatePickerField'
import { FormikSpeciesQuantitySeized } from '@features/Mission/components/MissionForm/ActionForm/shared/FormikSpeciesQuantitySeized'
import { UpdateMissionActionCompletionEffect } from '@features/Mission/components/MissionForm/ActionForm/shared/UpdateMissionActionCompletionEffect'
import { useIsMissionEnded } from '@features/Mission/components/MissionForm/hooks/useIsMissionEnded'
import { FormikCheckbox, FormikEffect, FormikTextarea, Icon } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash-es'
import styled from 'styled-components'

import { SeaControlFormCompletionSchema, SeaControlFormLiveSchema } from './schemas'
import { ControlQualityField } from './shared/ControlQualityField'
import { FormikAuthor } from './shared/FormikAuthor'
import { FormikCoordinatesPicker } from './shared/FormikCoordinatesPicker'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikOtherControlsCheckboxes } from './shared/FormikOtherControlsCheckboxes'
import { FormikRevalidationEffect } from './shared/FormikRevalidationEffect'
import { GearsField } from './shared/GearsField'
import { LicencesAndLogbookField } from './shared/LicencesAndLogbookField'
import { SpeciesField } from './shared/SpeciesField'
import { VesselField } from './shared/VesselField'
import { VesselFleetSegmentsField } from './shared/VesselFleetSegmentsField'
import { getVesselName, validateBeforeOnChange } from './utils'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type SeaControlFormProps = Readonly<{
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}>
export function SeaControlForm({ initialValues, onChange }: SeaControlFormProps) {
  const isMissionEnded = useIsMissionEnded()
  const validationSchema = isMissionEnded ? SeaControlFormCompletionSchema : SeaControlFormLiveSchema

  return (
    <Formik initialValues={initialValues} onSubmit={noop} validationSchema={validationSchema}>
      {({ validateForm, values }) => (
        <>
          <FormikEffect onChange={validateBeforeOnChange(initialValues, validateForm, onChange)} />
          <FormikRevalidationEffect />
          <UpdateMissionActionCompletionEffect />

          <ActionFormHeader>
            <Icon.FleetSegment />
            Contrôle en mer {values.vesselName && `– ${getVesselName(values.vesselName)}`}
          </ActionFormHeader>

          <FormBody>
            <VesselField />

            <DatePickerField />

            <FormikCoordinatesPicker />

            <LicencesAndLogbookField />

            <GearsField />

            <SpeciesField controlledWeightLabel="Qté estimée" />

            <SeizureFieldsetGroup isLight legend="Appréhension et déroutement">
              <FormikCheckbox label="Appréhension d’engin(s)" name="hasSomeGearsSeized" />
              <FormikCheckbox label="Appréhension d’espèce(s)" name="hasSomeSpeciesSeized" />
              <FormikSpeciesQuantitySeized />
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
