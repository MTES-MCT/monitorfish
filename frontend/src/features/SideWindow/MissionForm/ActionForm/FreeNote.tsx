import { Icon } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'

import { getLocalizedDayjs } from '../../../../utils/getLocalizedDayjs'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { PartialFreeNote } from '../types'

export type FreeNoteProps = {
  action: PartialFreeNote
}
export function FreeNote({ action }: FreeNoteProps) {
  const startDateAsDayjs = useMemo(() => getLocalizedDayjs(action.startDate), [action])

  return (
    <Formik initialValues={{}} onSubmit={noop}>
      <>
        <FormHead>
          <h2>
            <Icon.FishingEngine />
            Note libre ({startDateAsDayjs.format('D MMM à HH:mm')})
          </h2>
        </FormHead>

        <FormBody />
      </>
    </Formik>
  )
}
