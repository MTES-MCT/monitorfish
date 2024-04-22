import { SeaFrontGroup } from '@constants/seaFront'
import { propEq } from 'ramda'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { AlertAndReportingTab } from './constants'
import { PendingAlertsList } from './PendingAlertsList'
import { COLORS } from '../../../../constants/constants'
import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS } from '../../../../domain/entities/alerts/constants'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { ReportingList } from '../../../Reporting/components/ReportingList'
import { setSubMenu } from '../slice'

import type { RefObject } from 'react'

type AlertsAndReportingsProps = {
  baseRef: RefObject<HTMLDivElement>
  selectedSeaFrontGroup: SeaFrontGroup
  selectedTab: any
  setSelectedTab: any
}
export function AlertListAndReportingList({
  baseRef,
  selectedSeaFrontGroup,
  selectedTab,
  setSelectedTab
}: AlertsAndReportingsProps) {
  const dispatch = useMainAppDispatch()
  const focusedPendingAlertId = useMainAppSelector(state => state.alert.focusedPendingAlertId)
  const pendingAlerts = useMainAppSelector(state => state.alert.pendingAlerts)
  const silencedAlerts = useMainAppSelector(state => state.alert.silencedAlerts)

  const filteredSilencedAlerts = useMemo(
    () =>
      silencedAlerts.filter(silencedAlert => {
        const seaFronts = ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSeaFrontGroup]
          ? ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSeaFrontGroup].seaFronts
          : []

        return silencedAlert.value.seaFront && seaFronts.includes(silencedAlert.value.seaFront)
      }),
    [silencedAlerts, selectedSeaFrontGroup]
  )

  useEffect(() => {
    if (!focusedPendingAlertId) {
      return
    }

    const focusedPendingAlert = pendingAlerts.find(propEq(focusedPendingAlertId, 'id'))
    if (!focusedPendingAlert) {
      return
    }
    // TODO Remove the `as` as soon as the discriminator is added.
    const { seaFront } = focusedPendingAlert.value

    const menuSeaFrontName = Object.keys(ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS)
      .map(menuSeaFrontKey => ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[menuSeaFrontKey])
      .find(item => item.seaFronts.includes(seaFront))

    if (menuSeaFrontName) {
      dispatch(setSubMenu(menuSeaFrontName.menuSeaFront))
    }
  }, [dispatch, focusedPendingAlertId, pendingAlerts])

  return (
    <Wrapper>
      <Title
        isSelected={selectedTab === AlertAndReportingTab.ALERT}
        onClick={() => setSelectedTab(AlertAndReportingTab.ALERT)}
      >
        Alertes
      </Title>
      <Title
        data-cy="side-window-reporting-tab"
        isSelected={selectedTab === AlertAndReportingTab.REPORTING}
        onClick={() => setSelectedTab(AlertAndReportingTab.REPORTING)}
      >
        Signalements
      </Title>
      {selectedTab === AlertAndReportingTab.ALERT && (
        <>
          <PendingAlertsList
            baseRef={baseRef}
            numberOfSilencedAlerts={filteredSilencedAlerts.length}
            selectedSeaFrontGroup={selectedSeaFrontGroup}
          />
        </>
      )}
      {selectedTab === AlertAndReportingTab.REPORTING && (
        <ReportingList selectedSeaFrontGroup={selectedSeaFrontGroup} />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  flex-grow: 1;
  overflow: auto;
  margin-left: 30px;
`

// TODO This should be a `<a />` or a `<button />`.
const Title = styled.h2<{
  isSelected: boolean
}>`
  border-bottom: 5px solid ${p => (p.isSelected ? COLORS.charcoal : COLORS.white)};
  color: ${COLORS.gunMetal};
  cursor: pointer;
  display: inline-block;
  font-size: 22px;
  font-weight: 700;
  margin: 30px 10px;
  padding-bottom: 5px;
  text-align: left;
  transition: all 0.2s;
  width: fit-content;
`
