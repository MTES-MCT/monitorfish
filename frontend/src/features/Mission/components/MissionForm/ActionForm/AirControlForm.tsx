import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FormikDatePicker, FormikEffect, FormikTextarea, Icon, useNewWindow } from '@mtes-mct/monitor-ui'
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
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type AirControlFormProps = Readonly<{
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}>
export function AirControlForm({ initialValues, onChange }: AirControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const isClosing = useMainAppSelector(store => store.missionForm.isClosing)

  const titleDate = useMemo(
    () => initialValues.actionDatetimeUtc && getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )
  const validationSchema = useMemo(
    () => (isClosing ? AirControlFormClosureSchema : AirControlFormLiveSchema),
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
