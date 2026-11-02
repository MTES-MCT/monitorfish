import {
  SidebarHeader,
  SidebarList,
  SidebarZone
} from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo } from 'react'

import { RiskElementItem } from './RiskElementItem'
import { useGetVesselRiskElementsQuery } from '../../api'
import { LOGBOOK_RISK_ELEMENTS } from '../../constants'

type LogbookRiskElementsProps = Readonly<{
  className?: string
}>
export function LogbookRiskElements({ className }: LogbookRiskElementsProps) {
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const { data: riskElements } = useGetVesselRiskElementsQuery(
    selectedVesselIdentity?.internalReferenceNumber ?? skipToken
  )

  const displayedRiskElements = useMemo(
    () =>
      LOGBOOK_RISK_ELEMENTS.flatMap(displayedRiskElement => {
        const riskElement = riskElements?.find(({ code }) => code === displayedRiskElement.code)

        return riskElement ? [{ displayedRiskElement, riskElement }] : []
      }),
    [riskElements]
  )

  if (displayedRiskElements.length === 0) {
    return null
  }

  return (
    <SidebarZone className={className} data-cy="vessel-logbook-risk-elements">
      <SidebarHeader>Analyse des déclarations de pêche (12 derniers mois)</SidebarHeader>
      <SidebarList>
        {displayedRiskElements.map(({ displayedRiskElement, riskElement }) => (
          <RiskElementItem
            key={riskElement.code}
            displayedRiskElement={displayedRiskElement}
            riskElement={riskElement}
          />
        ))}
      </SidebarList>
    </SidebarZone>
  )
}
