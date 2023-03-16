import { Select } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { useCallback, useMemo } from 'react'

import { useGetPortsQuery } from '../../../../../api/port'
import { FrontendError } from '../../../../../libs/FrontendError'
import { useNewWindow } from '../../../../../ui/NewWindow'
import { FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function FormikPortSelect() {
  const { setFieldValue, values } = useFormikContext<MissionActionFormValues>()

  const { newWindowContainerRef } = useNewWindow()

  const getPortsApiQuery = useGetPortsQuery()

  const portsAsOptions: Option[] = useMemo(() => {
    if (!getPortsApiQuery.data) {
      return []
    }

    return getPortsApiQuery.data.map(({ locode, name }) => ({
      label: `${name} (${locode})`,
      value: locode
    }))
  }, [getPortsApiQuery.data])

  const handleChange = useCallback(
    (nextPortLocode: string | undefined) => {
      if (!getPortsApiQuery.data) {
        return
      }

      if (!nextPortLocode) {
        setFieldValue('portLocode', undefined)
        setFieldValue('portName', undefined)
      }

      const port = getPortsApiQuery.data.find(({ locode }) => locode === nextPortLocode)
      if (!port) {
        throw new FrontendError('`port` is undefined. This should never happen.')
      }

      setFieldValue('portLocode', port.locode)
      setFieldValue('portName', port.name)
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getPortsApiQuery.data]
  )

  if (!portsAsOptions.length) {
    return <FieldsetGroupSpinner legend="Lieu du contrôle" />
  }

  return (
    <Select
      baseContainer={newWindowContainerRef.current}
      defaultValue={values.portLocode}
      isLight
      label="Lieu du contrôle"
      name="port"
      onChange={handleChange}
      options={portsAsOptions}
      searchable
      virtualized
    />
  )
}
