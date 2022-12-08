import { Icon } from '@mtes-mct/monitor-ui'
import { Formik } from 'formik'
import { noop } from 'lodash'
import { useMemo } from 'react'

import { getLocalizedDayjs } from '../../../../utils/getLocalizedDayjs'
import { FormBody } from '../FormBody'
import { FormHead } from '../FormHead'

import type { PartialSeaControl } from '../types'

export type SeaControlProps = {
  action: PartialSeaControl
}
export function SeaControl({ action }: SeaControlProps) {
  const startDateAsDayjs = useMemo(() => getLocalizedDayjs(action.startDate), [action])

  return (
    <Formik initialValues={{}} onSubmit={noop}>
      <>
        <FormHead>
          <h2>
            <Icon.FleetSegment />
            Contrôle en mer ({startDateAsDayjs.format('D MMM à HH:mm')})
          </h2>
        </FormHead>

        <FormBody />
      </>
    </Formik>
  )
}
