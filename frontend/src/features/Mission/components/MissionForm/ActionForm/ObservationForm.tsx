import { FormikEffect, FormikTextarea, FormikTextInput, Icon } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'

import { ObservationFormLiveSchema } from './schemas'
import { getTitleDateFromUtcStringDate } from './shared/utils'
import { validateBeforeOnChange } from './utils'
import { FormBody } from '../shared/FormBody'
import { FormHead } from '../shared/FormHead'

import type { MissionActionFormValues } from '../types'
import type { Promisable } from 'type-fest'

type ObservationFormProps = Readonly<{
  initialValues: MissionActionFormValues
  onChange: (nextValues: MissionActionFormValues) => Promisable<void>
}>
export function ObservationForm({ initialValues, onChange }: ObservationFormProps) {
  const titleDate = useMemo(
    () => initialValues.actionDatetimeUtc && getTitleDateFromUtcStringDate(initialValues.actionDatetimeUtc),
    [initialValues.actionDatetimeUtc]
  )

  return (
    <Formik initialValues={initialValues} onSubmit={noop} validationSchema={ObservationFormLiveSchema}>
      {({ validateForm }) => (
        <>
          <FormikEffect onChange={validateBeforeOnChange(initialValues, validateForm, onChange)} />

          <FormHead>
            <h2>
              <Icon.Note />
              Note libre ({titleDate})
            </h2>
          </FormHead>

          <FormBody>
            <FormikTextarea isLight label="Observations, commentaires..." name="otherComments" rows={3} />

            <FormikTextInput isLight label="Saisi par" name="userTrigram" />
          </FormBody>
        </>
      )}
    </Formik>
  )
}
