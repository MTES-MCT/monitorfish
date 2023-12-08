import { FormikDatePicker, FormikEffect, FormikTextarea, Icon, useKey, useNewWindow } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash/fp'
import { useMemo } from 'react'

import { AirControlFormClosureSchema, AirControlFormLiveSchema } from './schemas'
import { FormikAuthor } from './shared/FormikAuthor'
import { FormikCoordinatesPicker } from './shared/FormikCoordinatesPicker'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikOtherControlsCheckboxes } from './shared/FormikOtherControlsCheckboxes'
import { FormikRevalidationEffect } from './shared/FormikRevalidationEffect'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { validateBeforeOnChange } from './utils'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type AirControlFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}
export function AirControlForm({ initialValues, onChange }: AirControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const mission = useMainAppSelector(store => store.mission)

  // We have to re-create the Formik component when `validationSchema` changes to apply it
  const key = useKey([mission.isClosing])
  const titleDate = useMemo(
    () => initialValues.actionDatetimeUtc && getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )
  const validationSchema = useMemo(
    () => (mission.isClosing ? AirControlFormClosureSchema : AirControlFormLiveSchema),
    [mission.isClosing]
  )

  return (
    <Formik key={key} initialValues={initialValues} onSubmit={noop} validationSchema={validationSchema}>
      {({ validateForm }) => (
        <>
          <FormikEffect onChange={validateBeforeOnChange(initialValues, validateForm, onChange)} />
          <FormikRevalidationEffect />

          <FormHead>
            <h2>
              <Icon.Plane />
              Contrôle aérien ({titleDate})
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
