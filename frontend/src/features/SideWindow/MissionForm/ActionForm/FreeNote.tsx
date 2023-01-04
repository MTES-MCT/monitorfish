import { FormikEffect, FormikTextarea, FormikTextInput, Icon } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'

import { getLocalizedDayjs } from '../../../../utils/getLocalizedDayjs'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { PartialFreeNote } from '../types'
import type { Promisable } from 'type-fest'

export type FreeNoteProps = {
  action: PartialFreeNote
  onChange: (nextNewAction: PartialFreeNote) => Promisable<void>
}
export function FreeNote({ action, onChange }: FreeNoteProps) {
  const startDateAsDayjs = useMemo(() => getLocalizedDayjs(action.startDate), [action])

  return (
    <Formik initialValues={action} onSubmit={noop}>
      <>
        <FormikEffect onChange={onChange as any} />

        <FormHead>
          <h2>
            <Icon.Note />
            Note libre ({startDateAsDayjs.format('D MMM à HH:mm')})
          </h2>
        </FormHead>

        <FormBody>
          <FormikTextarea isLight label="Observations, commentaires..." name="note" />
          <FormikTextInput isLight label="Saisi par" name="editedBy" />
        </FormBody>
      </>
    </Formik>
  )
}
