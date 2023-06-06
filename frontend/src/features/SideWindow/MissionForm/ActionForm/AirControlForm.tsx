import {
  FormikDatePicker,
  FormikEffect,
  FormikTextInput,
  FormikTextarea,
  Icon,
  useNewWindow
} from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash/fp'
import { useMemo } from 'react'

import { AirControlFormSchema } from './schemas'
import { FormikCoordinatesPicker } from './shared/FormikCoordinatesPicker'
import { FormikMultiInfractionPicker } from './shared/FormikMultiInfractionPicker'
import { FormikRevalidationEffect } from './shared/FormikRevalidationEffect'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { VesselField } from './shared/VesselField'
import { FieldsetGroup } from '../shared/FieldsetGroup'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { FormikFormError } from '../../../../types'
import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

export type AirControlFormProps = {
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
  onError: (nextFormError: FormikFormError) => Promisable<void>
}
export function AirControlForm({ initialValues, onChange, onError }: AirControlFormProps) {
  const { newWindowContainerRef } = useNewWindow()

  const titleDate = useMemo(
    () => initialValues.actionDatetimeUtc && getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={noop} validationSchema={AirControlFormSchema}>
      <>
        <FormikEffect onChange={onChange as any} onError={onError} />
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

          <FormikMultiInfractionPicker
            addButtonLabel="Ajouter une infraction"
            infractionLabel="Autre infraction"
            label="Infractions"
            name="otherInfractions"
          />

          <FieldsetGroup isLight legend="Autres observations">
            <FormikTextarea isLabelHidden label="Autres observations" name="otherComments" rows={2} />
          </FieldsetGroup>

          <FormikTextInput isLight label="Saisi par" name="userTrigram" />
        </FormBody>
      </>
    </Formik>
  )
}
