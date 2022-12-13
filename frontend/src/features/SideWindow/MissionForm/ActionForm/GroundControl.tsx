import { Icon } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'

import { getLocalizedDayjs } from '../../../../utils/getLocalizedDayjs'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { PartialGroundControl } from '../types'

export type GroundControlProps = {
  action: PartialGroundControl
}
export function GroundControl({ action }: GroundControlProps) {
  const startDateAsDayjs = useMemo(() => getLocalizedDayjs(action.startDate), [action])

  return (
    <Formik initialValues={{}} onSubmit={noop}>
      <>
        <FormHead>
          <h2>
            <Icon.FishingEngine />
            Contrôle à la débarque ({startDateAsDayjs.format('D MMM à HH:mm')})
          </h2>
        </FormHead>

        <FormBody />
      </>
    </Formik>
  )
}
