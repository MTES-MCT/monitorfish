import { useGetDistinctProducerOrganizationQuery } from '@features/ProducerOrganizationMembership/apis'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

export function useGetProducerOrganizationsAsOptions() {
  const { data: producerOrganizations = [] } = useGetDistinctProducerOrganizationQuery()

  const organizationNamesAsOptions: Option[] = useMemo(
    () =>
      producerOrganizations
        .map(producerOrganization => ({
          label: producerOrganization,
          value: producerOrganization
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [producerOrganizations]
  )

  return organizationNamesAsOptions
}
