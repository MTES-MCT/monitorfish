import { useGetProducerOrganizationMembershipsQuery } from '@features/ProducerOrganizationMembership/apis'
import { uniqBy } from 'lodash-es'
import { useMemo } from 'react'

import type { Option } from '@mtes-mct/monitor-ui'

export function useGetOrganizationMembershipNamesAsOptions() {
  const { data: memberships = [] } = useGetProducerOrganizationMembershipsQuery()

  const organizationNamesAsOptions: Option[] = useMemo(
    () =>
      uniqBy(
        memberships
          .map(membership => ({
            label: membership.organizationName,
            value: membership.organizationName
          }))
          .sort((a, b) => a.label.localeCompare(b.label)),
        'label'
      ),
    [memberships]
  )

  return organizationNamesAsOptions
}
