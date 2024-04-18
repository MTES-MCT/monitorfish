import { DatePickerField } from '@features/Mission/components/MissionForm/ActionForm/shared/DatePickerField'
import { UpdateMissionActionCompletionEffect } from '@features/Mission/components/MissionForm/ActionForm/shared/UpdateMissionActionCompletionEffect'
import { useIsMissionEnded } from '@features/Mission/components/MissionForm/hooks/useIsMissionEnded'
import { FormikEffect, FormikTextarea, Icon } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash/fp'

import { AirControlFormCompletionSchema, AirControlFormLiveSchema } from './schemas'
import { ActionFormHeader } from './shared/ActionFormHeader'
import { FormikAuthor } from './shared/FormikAuthor'
import { FormikCoordinatesPicker } from './shared/FormikCoordinatesPicker'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikOtherControlsCheckboxes } from './shared/FormikOtherControlsCheckboxes'
import { FormikRevalidationEffect } from './shared/FormikRevalidationEffect'
import { VesselField } from './shared/VesselField'
import { getVesselName, validateBeforeOnChange } from './utils'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type AirControlFormProps = Readonly<{
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}>
export function AirControlForm({ initialValues, onChange }: AirControlFormProps) {
  const isMissionEnded = useIsMissionEnded()
  const validationSchema = isMissionEnded ? AirControlFormCompletionSchema : AirControlFormLiveSchema

  return (
    <Formik initialValues={initialValues} onSubmit={noop} validationSchema={validationSchema}>
      {({ validateForm, values }) => (
        <>
          <FormikEffect onChange={validateBeforeOnChange(initialValues, validateForm, onChange)} />
          <FormikRevalidationEffect />
          <UpdateMissionActionCompletionEffect />

          <ActionFormHeader>
            <Icon.Plane />
            Contrôle aérien {values.vesselName && `– ${getVesselName(values.vesselName)}`}
          </ActionFormHeader>

          <FormBody>
            <VesselField />

            <DatePickerField />

            <FormikCoordinatesPicker />

            <FormikMultiInfractionPicker addButtonLabel="Ajouter une infraction" label="Infractions" />

            <FieldsetGroup isLight legend="Autres observations">
              <FormikTextarea isLabelHidden label="Autres observations" name="otherComments" rows={2} />
            </FieldsetGroup>

            <FormikOtherControlsCheckboxes />

            <FormikAuthor />
          </FormBody>
        </>
      )}
    </Formik>
  )
}
