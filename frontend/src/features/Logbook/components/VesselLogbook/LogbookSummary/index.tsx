import { VesselSidebarFleetSegments } from '@features/FleetSegment/components/VesselSidebarFleetSegments'
import { getLastLogbookTripsOptions } from '@features/Logbook/components/VesselLogbook/LogbookMessages/utils'
import { SidebarZone } from '@features/Vessel/components/VesselSidebar/components/common/common.style'
import { updateVesselTrackAndLogbookFromTrip } from '@features/Vessel/useCases/updateVesselTrackAndLogbookFromTrip'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, IconButton, Select, Tag, THEME } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useMemo } from 'react'
import styled from 'styled-components'

import { CPSMessageResume } from './summaries/CPSMessageResume'
import { DEPMessageResume } from './summaries/DEPMessageResume'
import { DISMessageResume } from './summaries/DISMessageResume'
import { EmptyResume } from './summaries/EmptyResume'
import { FARMessageResume } from './summaries/FARMessageResume'
import { LANMessageResume } from './summaries/LANMessageResume'
import { PNOMessageResume } from './summaries/PNOMessageResume'
import ArrowSVG from '../../../../icons/Picto_fleche-pleine-droite.svg?react'
import { useGetLastLogbookTripsQuery } from '../../../api'
import {
  LogbookMessageType as LogbookMessageTypeEnum,
  LogbookOperationType,
  LogbookSoftwareLabel,
  NavigateTo
} from '../../../constants'
import { CustomDatesShowedInfo } from '../CustomDatesShowedInfo'
import { getLogbookTripSummary } from '../utils'

import type { LogbookTripSummary } from '../types'
import type { Promisable } from 'type-fest'

type LogbookSummaryProps = Readonly<{
  showLogbookMessages: (messageType?: string) => Promisable<void>
}>

export function LogbookSummary({ showLogbookMessages }: LogbookSummaryProps) {
  const dispatch = useMainAppDispatch()
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const logbookMessages = useMainAppSelector(state => state.fishingActivities.logbookMessages)
  const software = useMainAppSelector(state => state.fishingActivities.software)
  const isFirstVoyage = useMainAppSelector(state => state.fishingActivities.isFirstVoyage)
  const isLastVoyage = useMainAppSelector(state => state.fishingActivities.isLastVoyage)
  const tripNumber = useMainAppSelector(state => state.fishingActivities.tripNumber)

  const { data: lastLogbookTrips } = useGetLastLogbookTripsQuery(
    selectedVesselIdentity?.internalReferenceNumber ?? skipToken
  )

  const lastLogbookTripsOptions = getLastLogbookTripsOptions(lastLogbookTrips, tripNumber)
  const logbookTrip: LogbookTripSummary = useMemo(() => getLogbookTripSummary(logbookMessages), [logbookMessages])

  const goToPreviousTrip = () => {
    dispatch(updateVesselTrackAndLogbookFromTrip(selectedVesselIdentity, NavigateTo.PREVIOUS, true))
  }
  const goToNextTrip = () => {
    dispatch(updateVesselTrackAndLogbookFromTrip(selectedVesselIdentity, NavigateTo.NEXT, true))
  }
  const goToLastTrip = () => {
    dispatch(updateVesselTrackAndLogbookFromTrip(selectedVesselIdentity, NavigateTo.LAST, true))
  }
  const getLogbookTrip = (nextTripNumber: string | undefined) => {
    dispatch(updateVesselTrackAndLogbookFromTrip(selectedVesselIdentity, NavigateTo.EQUALS, true, nextTripNumber))
  }

  if (!logbookMessages) {
    return (
      <Body>
        <StyledVesselSidebarFleetSegments
          activityOrigin={selectedVessel?.activityOrigin}
          segments={selectedVessel?.riskFactor?.segments}
        />
        <NoFishingActivities data-cy="vessel-fishing">Ce navire n’a pas envoyé de message JPE.</NoFishingActivities>
      </Body>
    )
  }

  return (
    <>
      {logbookMessages ? (
        <Body>
          <StyledVesselSidebarFleetSegments
            activityOrigin={selectedVessel?.activityOrigin}
            segments={selectedVessel?.riskFactor?.segments}
          />
          <SidebarZone>
            <Title $hasTwoLines={false}>
              <Text $hasTwoLines>
                Résumé
                <StyledTag
                  backgroundColor={THEME.color.gainsboro}
                  color={THEME.color.gunMetal}
                  title={software ? LogbookSoftwareLabel[software] : 'Inconnu'}
                >
                  {software}
                </StyledTag>
              </Text>
              <TextValue $hasTwoLines={false} data-cy="vessel-fishing-trip-number">
                <PreviousTrip
                  $disabled={!!isFirstVoyage}
                  accent={Accent.TERTIARY}
                  data-cy="vessel-fishing-previous-trip"
                  Icon={Icon.Chevron}
                  iconSize={20}
                  onClick={!isFirstVoyage ? goToPreviousTrip : undefined}
                  title="Marée précédente"
                />
                <Select
                  isCleanable={false}
                  isLabelHidden
                  label="Numéro de marée"
                  name="tripNumber"
                  onChange={getLogbookTrip}
                  options={lastLogbookTripsOptions}
                  searchable
                  value={tripNumber ?? undefined}
                />
                <NextTrip
                  $disabled={!!isLastVoyage}
                  accent={Accent.TERTIARY}
                  data-cy="vessel-fishing-next-trip"
                  Icon={Icon.Chevron}
                  iconSize={20}
                  onClick={!isLastVoyage ? goToNextTrip : undefined}
                  title="Marée suivante"
                />
                <LastTrip
                  $disabled={!!isLastVoyage}
                  accent={Accent.TERTIARY}
                  data-cy="vessel-fishing-last-trip"
                  Icon={Icon.DoubleChevron}
                  iconSize={20}
                  onClick={!isLastVoyage ? goToLastTrip : undefined}
                  title="Dernière marée"
                />
              </TextValue>
              <SeeAll data-cy="vessel-fishing-see-all" onClick={() => showLogbookMessages()}>
                Voir tous les messages
              </SeeAll>
              <Arrow onClick={() => showLogbookMessages()} />
            </Title>
            <CustomDatesShowedInfo />
            {logbookMessages?.length ? (
              <LogbookMessages>
                <li>
                  {logbookTrip.dep.log ? (
                    <DEPMessageResume
                      isDeleted={logbookTrip.dep.log.isDeleted}
                      isNotAcknowledged={
                        !!logbookTrip.dep.log.acknowledgment && logbookTrip.dep.log.acknowledgment?.isSuccess === false
                      }
                      messageValue={logbookTrip.dep.log.message}
                      rejectionCause={logbookTrip.dep.log.acknowledgment?.rejectionCause ?? undefined}
                      showLogbookMessages={showLogbookMessages}
                    />
                  ) : (
                    <EmptyResume messageType={LogbookMessageTypeEnum.DEP.code.toString()} />
                  )}
                </li>
                <li>
                  {logbookTrip.far.logs.length && logbookTrip.far.logs[0] ? (
                    <FARMessageResume
                      allFARMessagesAreNotAcknowledged={logbookTrip.far.areAllMessagesNotAcknowledged}
                      id={logbookTrip.far.logs[0].reportId}
                      numberOfMessages={
                        logbookTrip.far.logs.filter(message => message.operationType === LogbookOperationType.DAT)
                          .length
                      }
                      showLogbookMessages={showLogbookMessages}
                      speciesAndPresentationToWeightOfFAR={logbookTrip.far.speciesAndPresentationToWeight}
                      speciesToWeightOfFAR={logbookTrip.far.speciesToWeight}
                      totalFARWeight={logbookTrip.far.totalWeight}
                    />
                  ) : (
                    <EmptyResume messageType={LogbookMessageTypeEnum.FAR.code.toString()} />
                  )}
                </li>
                <li>
                  {logbookTrip.cps.logs.length ? (
                    <CPSMessageResume
                      hasNoMessageAcknowledged={logbookTrip.cps.areAllMessagesNotAcknowledged}
                      messageValues={logbookTrip.cps.logs}
                      numberOfSpecies={logbookTrip.cps.numberOfSpecies}
                      showLogbookMessages={showLogbookMessages}
                    />
                  ) : (
                    <EmptyResume messageType={LogbookMessageTypeEnum.CPS.code.toString()} />
                  )}
                </li>
                <li>
                  {logbookTrip.dis.logs?.length && logbookTrip.dis.logs[0] ? (
                    <DISMessageResume
                      allDISMessagesAreNotAcknowledged={logbookTrip.dis.areAllMessagesNotAcknowledged}
                      id={logbookTrip.dis.logs[0].reportId}
                      numberOfMessages={
                        logbookTrip.dis.logs.filter(message => message.operationType === LogbookOperationType.DAT)
                          .length
                      }
                      showLogbookMessages={showLogbookMessages}
                      speciesToWeightOfDIS={logbookTrip.dis.speciesToWeight}
                      totalDISWeight={logbookTrip.dis.totalWeight}
                    />
                  ) : (
                    <EmptyResume messageType={LogbookMessageTypeEnum.DIS.code.toString()} />
                  )}
                </li>
                <li>
                  {logbookTrip.pno.log ? (
                    <PNOMessageResume
                      id={logbookTrip.pno.log.reportId}
                      isDeleted={logbookTrip.pno.log.isDeleted}
                      isNotAcknowledged={
                        !!logbookTrip.pno.log.acknowledgment && !logbookTrip.pno.log.acknowledgment.isSuccess
                      }
                      pnoMessage={logbookTrip.pno.log}
                      showLogbookMessages={showLogbookMessages}
                      speciesToWeightOfFAR={logbookTrip.far.speciesToWeight}
                      speciesToWeightOfPNO={logbookTrip.pno.speciesToWeight}
                      totalFARAndDEPWeight={logbookTrip.far.totalWeight + logbookTrip.dep.totalWeight}
                      totalPNOWeight={logbookTrip.pno.totalWeight}
                    />
                  ) : (
                    <EmptyResume messageType={LogbookMessageTypeEnum.PNO.code.toString()} />
                  )}
                </li>

                <li>
                  {logbookTrip.lan.log ? (
                    <LANMessageResume
                      isDeleted={logbookTrip.lan.log.isDeleted}
                      isNotAcknowledged={
                        !!logbookTrip.lan.log.acknowledgment && !logbookTrip.lan.log.acknowledgment.isSuccess
                      }
                      lanMessage={logbookTrip.lan.log.message}
                      showLogbookMessages={showLogbookMessages}
                      speciesToWeightOfFAR={logbookTrip.far.speciesToWeight}
                      speciesToWeightOfLAN={logbookTrip.lan.speciesToWeight}
                      speciesToWeightOfPNO={logbookTrip.pno.speciesToWeight}
                      totalLANWeight={logbookTrip.lan.totalWeight}
                      totalPNOWeight={logbookTrip.pno.totalWeight}
                    />
                  ) : (
                    <EmptyResume messageType={LogbookMessageTypeEnum.LAN.code.toString()} />
                  )}
                </li>
              </LogbookMessages>
            ) : (
              <NoMessage>Aucun message reçu</NoMessage>
            )}
          </SidebarZone>
        </Body>
      ) : null}
    </>
  )
}

const StyledTag = styled(Tag)`
  margin-left: 6px;
`

const NoFishingActivities = styled.div`
  padding: 50px 5px 0 5px;
  height: 70px;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.slateGray};
  text-align: center;
`

const StyledVesselSidebarFleetSegments = styled(VesselSidebarFleetSegments)`
  margin-bottom: 10px;
`

export const PreviousTrip = styled(IconButton)<{
  $disabled: boolean
}>`
  cursor: ${p => (p.$disabled ? 'not-allowed' : 'pointer')};
  vertical-align: middle;
  margin-right: 6px;
  padding: 0;
  transform: rotate(90deg);
  display: inline-block;
`

export const NextTrip = styled(IconButton)<{
  $disabled: boolean
}>`
  cursor: ${p => (p.$disabled ? 'not-allowed' : 'pointer')};
  vertical-align: middle;
  margin-left: 6px;
  margin-right: 2px;
  transform: rotate(-90deg);
  padding: 0;
  display: inline-block;
`

export const LastTrip = styled(IconButton)<{
  $disabled: boolean
}>`
  cursor: ${p => (p.$disabled ? 'not-allowed' : 'pointer')};
  vertical-align: middle;
  transform: rotate(-90deg);
  display: inline-block;
  padding: 0;
`

const NoMessage = styled.div`
  text-align: center;
  margin-top: 20px;
  padding-bottom: 20px;
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  width: 100%;
`

const Arrow = styled(ArrowSVG)`
  margin-left: 5px;
  order: 4;
  margin-top: 4px;
  cursor: pointer;
  padding-top: 4px;
`

const SeeAll = styled.a`
  text-align: right;
  text-decoration: none;
  font-size: 11px;
  line-height: 10px;
  color: ${p => p.theme.color.slateGray};
  margin-left: auto;
  order: 3;
  cursor: pointer;
  width: 70px;
  padding-top: 4px;
`

const LogbookMessages = styled.ul`
  margin: 0 0 0 0;
  padding: 0;
  width: -moz-available;
  width: -webkit-fill-available;

  > li {
    margin: 0;
    border-radius: 0;
    padding: 0;
    overflow: hidden;
    border-bottom: 1px solid ${p => p.theme.color.lightGray};
  }
`

const Text = styled.div<{
  $hasTwoLines?: boolean
}>`
  color: ${p => p.theme.color.slateGray};
  font-size: 13px;
  font-weight: 500;
  padding-top: ${p => (p.$hasTwoLines ? '5px' : '0')};
`

const TextValue = styled.div<{
  $hasTwoLines?: boolean
}>`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  margin: 0;
  padding-left: 12px;
  padding-top: ${p => (p.$hasTwoLines ? '6px' : '0')};

  .Field-Select {
    background-color: ${p => p.theme.color.gainsboro};
    border-color: ${p => p.theme.color.gainsboro};
    display: inline-block;
    width: 160px;

    .rs-picker-toggle-wrapper {
      width: 100%;
    }
  }

  .rs-picker-select > .rs-picker-toggle {
    padding: 4px 25px 6px 8px;
  }

  .rs-picker-select-menu {
    min-width: 160px !important;
    width: 160px !important;
  }

  .rs-picker-search-bar-input {
    min-width: 120px !important;
    width: 120px !important;
  }

  .rs-stack {
    min-width: 125px;
  }
`

const Body = styled.div`
  padding: 10px 10px 10px 10px;
`

const Title = styled.div<{
  $hasTwoLines?: boolean
}>`
  color: ${p => p.theme.color.slateGray};
  background: ${p => p.theme.color.lightGray};
  padding: ${p => (p.$hasTwoLines ? '7px 10px 7px 20px;' : '8.5px 10px 8px 20px;')};
  font-size: 13px;
  flex-shrink: 0;
  flex-grow: 2;
  display: flex;
  width: 400px;
`
