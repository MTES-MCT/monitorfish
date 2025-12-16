import { useGetThreatCharacterizationsQuery } from '@features/Infraction/apis'
import { DEFAULT_THREAT, DEFAULT_THREAT_CHARACTERIZATION } from '@features/Infraction/constants'
import { useMemo } from 'react'

import type { Threat } from '@features/Infraction/types'

export function useGetThreatCharacterizationAsTreeOptions(threats?: Array<Threat>) {
  const getThreatCharacterizationApiQuery = useGetThreatCharacterizationsQuery()

  // We add manually to the referential a missing unknown threat with the legacy Natinf
  const UNKNOWN_THREAT_TO_ADD = (() => {
    const threat = threats?.[0]?.label
    const threatCharacterization = threats?.[0]?.children?.[0]?.label
    const natinf = threats?.[0]?.children?.[0]?.children?.[0]?.value

    const hasSingleValue =
      threats?.length === 1 &&
      threats?.[0]?.children?.length === 1 &&
      threats?.[0]?.children?.[0]?.children?.length === 1

    if (
      hasSingleValue &&
      threat === DEFAULT_THREAT &&
      threatCharacterization === DEFAULT_THREAT_CHARACTERIZATION &&
      !!natinf
    ) {
      return [
        {
          children: [
            {
              children: [
                {
                  label: natinf,
                  value: natinf
                }
              ],
              label: DEFAULT_THREAT_CHARACTERIZATION,
              value: DEFAULT_THREAT_CHARACTERIZATION
            }
          ],
          label: DEFAULT_THREAT,
          value: DEFAULT_THREAT
        } as Threat
      ]
    }

    return []
  })()

  const threatCharacterizationAsOptions = useMemo(() => {
    if (!getThreatCharacterizationApiQuery.data) {
      return []
    }

    return getThreatCharacterizationApiQuery.data.concat(UNKNOWN_THREAT_TO_ADD)
  }, [getThreatCharacterizationApiQuery.data, UNKNOWN_THREAT_TO_ADD])

  return threatCharacterizationAsOptions
}
