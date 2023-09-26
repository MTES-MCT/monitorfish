import { Select } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/dist/query'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { CustomDatesShowedInfo } from './CustomDatesShowedInfo'
import DEPMessageResume from './DEPMessageResume'
import DISMessageResume from './DISMessageResume'
import { EmptyResume } from './EmptyResume'
import { FARMessageResume } from './FARMessageResume'
import LANMessageResume from './LANMessageResume'
import PNOMessageResume from './PNOMessageResume'
import { getLogbookTripSummary, getUniqueGears } from './utils'
import { COLORS } from '../../../../constants/constants'
import { COMMON_ALERT_TYPE_OPTION } from '../../../../domain/entities/alerts/constants'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import FleetSegments from '../../../fleet_segments/FleetSegments'
import ArrowLastTripSVG from '../../../icons/Double_fleche_navigation_marees.svg?react'
import ArrowTripSVG from '../../../icons/Fleche_navigation_marees.svg?react'
import ArrowSVG from '../../../icons/Picto_fleche-pleine-droite.svg?react'
import { useGetLastLogbookTripsQuery } from '../../api'
import { LogbookMessageType as LogbookMessageTypeEnum, LogbookOperationType, NavigateTo } from '../../constants'
import { getVesselLogbook } from '../../useCases/getVesselLogbook'
import { getFAOZonesFromFARMessages } from '../../utils'

import type { LogbookTripSummary } from './types'
import type { Promisable } from 'type-fest'

type FishingActivitiesSummaryProps = {
  navigation: {
    goToLastTrip: () => Promisable<void>
    goToNextTrip: () => Promisable<void>
    goToPreviousTrip: () => Promisable<void>
  }
  showLogbookMessages: (messageType?: string) => Promisable<void>
}
export function FishingActivitiesSummary({ navigation, showLogbookMessages }: FishingActivitiesSummaryProps) {
  const dispatch = useMainAppDispatch()
  const { selectedVessel } = useMainAppSelector(state => state.vessel)
  const { fishingActivities, isFirstVoyage, isLastVoyage, tripNumber } = useMainAppSelector(
    state => state.fishingActivities
  )
  const fleetSegments = useMainAppSelector(state => state.fleetSegment.fleetSegments)

  const { data: lastLogbookTrips } = useGetLastLogbookTripsQuery(selectedVessel?.internalReferenceNumber || skipToken)

  const getLogbookTrip = useCallback(
    (nextTripNumber: string | undefined) => {
      dispatch(getVesselLogbook(selectedVessel, NavigateTo.EQUALS, true, nextTripNumber))
    },
    [dispatch, selectedVessel]
  )

  const lastLogbookTripsOptions = useMemo(
    () =>
      lastLogbookTrips?.map(trip => ({
        label: `Marée n°${trip}`,
        value: trip
      })) || [],
    [lastLogbookTrips]
  )

  const logbookTrip: LogbookTripSummary = useMemo(() => getLogbookTripSummary(fishingActivities), [fishingActivities])

  const faoZones = getFAOZonesFromFARMessages(logbookTrip.far.logs)

  const catchesOverToleranceAlert = useMemo(() => {
    if (!fishingActivities?.alerts?.length) {
      return undefined
    }

    return fishingActivities.alerts.find(
      alert => alert?.value?.type === COMMON_ALERT_TYPE_OPTION.PNO_LAN_WEIGHT_TOLERANCE_ALERT.code
    )?.value
  }, [fishingActivities?.alerts])

  const depGears = useMemo(() => {
    if (!logbookTrip.dep?.log?.message?.gearOnboard?.length) {
      return <NoValue>-</NoValue>
    }

    const uniqueGears = getUniqueGears(logbookTrip.dep.log.message.gearOnboard)

    return uniqueGears.map(gear => {
      if (!gear.gearName) {
        return (
          <span key={gear.gear}>
            {gear.gear}
            <br />
          </span>
        )
      }

      return (
        <span key={gear.gear}>
          {gear.gearName} ({gear.gear})<br />
        </span>
      )
    })
  }, [logbookTrip.dep?.log])

  return (
    <>
      {fishingActivities ? (
        <Body>
          <Zone white>
            <Title>
              <Text>Segment(s) de flotte(s) actuel(s)</Text>
              <TextValue>
                <FleetSegments fleetSegmentsReferential={fleetSegments} selectedVessel={selectedVessel} />
              </TextValue>
            </Title>
            <Fields>
              <TableBody>
                <Field>
                  <Key>Engins à bord (JPE)</Key>
                  <Value data-cy="vessel-fishing-gears">{depGears}</Value>
                </Field>
                <Field>
                  <Key>Zones de la marée (JPE)</Key>
                  <Value>
                    {faoZones?.length ? (
                      faoZones.map((faoZone, index) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <span key={index}>
                          {faoZone}
                          {index === faoZones.length - 1 ? '' : ', '}
                        </span>
                      ))
                    ) : (
                      <NoValue>-</NoValue>
                    )}
                  </Value>
                </Field>
              </TableBody>
            </Fields>
          </Zone>
          <Zone>
            <Title hasTwoLines={false}>
              <Text hasTwoLines>Résumé du JPE</Text>
              <TextValue data-cy="vessel-fishing-trip-number" hasTwoLines={false}>
                <PreviousTrip
                  data-cy="vessel-fishing-previous-trip"
                  disabled={isFirstVoyage}
                  onClick={!isFirstVoyage ? navigation.goToPreviousTrip : undefined}
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
                  value={tripNumber || undefined}
                />
                <NextTrip
                  data-cy="vessel-fishing-next-trip"
                  disabled={isLastVoyage}
                  onClick={!isLastVoyage ? navigation.goToNextTrip : undefined}
                  title="Marée suivante"
                />
                <LastTrip
                  data-cy="vessel-fishing-last-trip"
                  disabled={isLastVoyage}
                  onClick={!isLastVoyage ? navigation.goToLastTrip : undefined}
                  title="Dernière marée"
                />
              </TextValue>
              <SeeAll data-cy="vessel-fishing-see-all" onClick={() => showLogbookMessages()}>
                Voir tous les messages
              </SeeAll>
              <Arrow onClick={() => showLogbookMessages()} />
            </Title>
            <CustomDatesShowedInfo />
            {fishingActivities?.logbookMessages?.length ? (
              <LogbookMessages>
                {logbookTrip.dep.log ? (
                  <DEPMessageResume
                    depMessage={logbookTrip.dep.log.message}
                    id={logbookTrip.dep.log.reportId}
                    isDeleted={logbookTrip.dep.log.deleted}
                    isNotAcknowledged={
                      logbookTrip.dep.log.acknowledge && logbookTrip.dep.log.acknowledge?.isSuccess === false
                    }
                    rejectionCause={logbookTrip.dep.log.acknowledge?.rejectionCause}
                    showLogbookMessages={showLogbookMessages}
                  />
                ) : (
                  <EmptyResume messageType={LogbookMessageTypeEnum.DEP.code.toString()} />
                )}

                {logbookTrip.far.logs.length && logbookTrip.far.logs[0] ? (
                  <FARMessageResume
                    allFARMessagesAreNotAcknowledged={logbookTrip.far.areAllMessagesNotAcknowledged}
                    id={logbookTrip.far.logs[0].reportId}
                    numberOfMessages={
                      logbookTrip.far.logs.filter(message => message.operationType === LogbookOperationType.DAT).length
                    }
                    showLogbookMessages={showLogbookMessages}
                    speciesAndPresentationToWeightOfFAR={logbookTrip.far.speciesAndPresentationToWeight}
                    speciesToWeightOfFAR={logbookTrip.far.speciesToWeight}
                    totalFARWeight={logbookTrip.far.totalWeight}
                  />
                ) : (
                  <EmptyResume messageType={LogbookMessageTypeEnum.FAR.code.toString()} />
                )}

                {logbookTrip.dis.logs?.length && logbookTrip.dis.logs[0] ? (
                  <DISMessageResume
                    allDISMessagesAreNotAcknowledged={logbookTrip.dis.areAllMessagesNotAcknowledged}
                    id={logbookTrip.dis.logs[0].reportId}
                    numberOfMessages={
                      logbookTrip.dis.logs.filter(message => message.operationType === LogbookOperationType.DAT).length
                    }
                    showLogbookMessages={showLogbookMessages}
                    speciesToWeightOfDIS={logbookTrip.dis.speciesToWeight}
                    totalDISWeight={logbookTrip.dis.totalWeight}
                  />
                ) : (
                  <EmptyResume messageType={LogbookMessageTypeEnum.DIS.code.toString()} />
                )}

                {logbookTrip.pno.log ? (
                  <PNOMessageResume
                    id={logbookTrip.pno.log.reportId}
                    isDeleted={logbookTrip.pno.log.deleted}
                    isNotAcknowledged={logbookTrip.pno.log.acknowledge && !logbookTrip.pno.log.acknowledge.isSuccess}
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

                {logbookTrip.lan.log ? (
                  <LANMessageResume
                    catchesOverToleranceAlert={catchesOverToleranceAlert}
                    id={logbookTrip.lan.log.reportId}
                    isDeleted={logbookTrip.lan.log.deleted}
                    isNotAcknowledged={logbookTrip.lan.log.acknowledge && !logbookTrip.lan.log.acknowledge.isSuccess}
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
              </LogbookMessages>
            ) : (
              <NoMessage>Aucun message reçu</NoMessage>
            )}
          </Zone>
        </Body>
      ) : null}
    </>
  )
}

const PreviousTrip = styled(ArrowTripSVG)<{
  disabled: boolean
}>`
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: middle;
  width: 14px;
  margin-right: 10px;
  transform: rotate(180deg);
`

const NextTrip = styled(ArrowTripSVG)<{
  disabled: boolean
}>`
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: middle;
  width: 14px;
  margin-left: 10px;
`

const LastTrip = styled(ArrowLastTripSVG)<{
  disabled: boolean
}>`
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: middle;
  width: 14px;
  margin-left: 5px;
`

const NoMessage = styled.div`
  text-align: center;
  margin-top: 20px;
  padding-bottom: 20px;
  font-size: 13px;
  color: ${COLORS.slateGray};
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
  color: ${COLORS.slateGray};
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
`

const Text = styled.div<{
  hasTwoLines?: boolean
}>`
  color: ${COLORS.slateGray};
  font-size: 13px;
  font-weight: 500;
  padding-top: ${p => (p.hasTwoLines ? '5px' : '0')};
`

const TextValue = styled.div<{
  hasTwoLines?: boolean
}>`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  font-weight: 500;
  margin: 0;
  padding-left: 20px;
  padding-top: ${p => (p.hasTwoLines ? '6px' : '0')};

  .Field-Select {
    display: inline-block;
    margin-right: 35px;
    width: 125px;
  }

  .rs-picker-select > .rs-picker-toggle {
    padding: 4px 25px 6px 8px;
  }

  .rs-picker-select-menu {
    min-width: 160px !important;
  }

  .rs-picker-search-bar-input {
    min-width: 135px !important;
  }
`

const Body = styled.div`
  padding: 5px 5px 1px 5px;
`

const TableBody = styled.tbody``

const Title = styled.div<{
  hasTwoLines?: boolean
}>`
  color: ${COLORS.slateGray};
  background: ${COLORS.lightGray};
  padding: ${p => (p.hasTwoLines ? '7px 10px 7px 20px;' : '8.5px 10px 8px 20px;')}
  font-size: 13px;
  flex-shrink: 0;
  flex-grow: 2;
  display: flex;
  width: 400px;
`

const Zone = styled.div<{
  white?: boolean
}>`
  margin: 5px 5px 10px 5px;
  text-align: left;
  display: flex;
  flex-wrap: wrap;
  background: ${p => (p.white ? COLORS.white : 'unset')};
`

const Fields = styled.table`
  padding: 10px 5px 5px 35px;
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  margin-top: 5px;
  margin-bottom: 5px;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.slateGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  font-weight: 500;
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
`
