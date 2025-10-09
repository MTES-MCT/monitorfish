import { useGetPortsQuery } from '@api/port'
import { HIDDEN_ERROR } from '@features/Mission/components/MissionForm/constants'
import { FrontendError } from '@libs/FrontendError'
import { CustomSearch, FieldError, Select } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import { sortBy } from 'lodash-es'
import { useMemo } from 'react'
import styled from 'styled-components'

import { useGetMissionActionFormikUsecases } from '../../hooks/useGetMissionActionFormikUsecases'
import { FieldsetGroupSpinner } from '../../shared/FieldsetGroup'

import type { MissionActionFormValues } from '../../types'
import type { Option } from '@mtes-mct/monitor-ui'

export function FormikPortSelect() {
  const { errors, setFieldValue, values } = useFormikContext<MissionActionFormValues>()
  const { initMissionLocation, updateFAOAreasAndSegments, updateMissionLocation } = useGetMissionActionFormikUsecases()

  const getPortsApiQuery = useGetPortsQuery()

  const portsAsOptions: Option[] = useMemo(() => {
    if (!getPortsApiQuery.data) {
      return []
    }

    const sortedPorts = sortBy(getPortsApiQuery.data, ['name'])

    return sortedPorts.map(({ locode, name }) => ({
      label: `${name} (${locode})`,
      value: locode
    }))
  }, [getPortsApiQuery.data])

  const handleChange = (nextPortLocode: string | undefined) => {
    if (!getPortsApiQuery.data) {
      return
    }

    if (!nextPortLocode) {
      setFieldValue('portLocode', undefined)
      initMissionLocation()

      return
    }

    const port = getPortsApiQuery.data.find(({ locode }) => locode === nextPortLocode)
    if (!port) {
      throw new FrontendError('`port` is undefined')
    }

    setFieldValue('portLocode', port.locode)
    const valuesWithPort = {
      ...values,
      portLocode: port.locode
    }
    updateFAOAreasAndSegments(valuesWithPort)
    updateMissionLocation(valuesWithPort)
  }

  const customSearch = useMemo(
    () =>
      portsAsOptions.length > 0
        ? new CustomSearch(
            structuredClone(portsAsOptions),
            [
              {
                name: 'label',
                weight: 0.9
              },
              {
                name: 'value',
                weight: 0.1
              }
            ],
            { cacheKey: 'PORTS_AS_OPTIONS', threshold: 0.4 }
          )
        : undefined,
    [portsAsOptions]
  )

  if (!portsAsOptions.length || !customSearch) {
    return <FieldsetGroupSpinner legend="Port de contrôle" />
  }

  return (
    <>
      <Select
        customSearch={customSearch}
        error={errors.portLocode}
        isErrorMessageHidden
        isLight
        isRequired
        label="Port de contrôle"
        name="port"
        onChange={handleChange}
        options={portsAsOptions}
        searchable
        value={values.portLocode}
      />

      {errors.portLocode && errors.portLocode !== HIDDEN_ERROR && (
        <StyledFieldError>{errors.portLocode}</StyledFieldError>
      )}
    </>
  )
}

const StyledFieldError = styled(FieldError)`
  /*
    For some unknown reason, there is a shadow "spacing" between the <Select /> and this <p />.
    The expected margin-top is 4px.
  */
  margin: 0;
`
