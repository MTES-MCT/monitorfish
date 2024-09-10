import { Select } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'

import { FleetSegments } from './FleetSegments'
import { CPSMessageResume } from './summaries/CPSMessageResume'
import { DEPMessageResume } from './summaries/DEPMessageResume'
import { DISMessageResume } from './summaries/DISMessageResume'
import { EmptyResume } from './summaries/EmptyResume'
import { FARMessageResume } from './summaries/FARMessageResume'
import { LANMessageResume } from './summaries/LANMessageResume'
import { PNOMessageResume } from './summaries/PNOMessageResume'
import { COMMON_ALERT_TYPE_OPTION } from '../../../../../domain/entities/alerts/constants'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import ArrowLastTripSVG from '../../../../icons/Double_fleche_navigation_marees.svg?react'
import ArrowTripSVG from '../../../../icons/Fleche_navigation_marees.svg?react'
import ArrowSVG from '../../../../icons/Picto_fleche-pleine-droite.svg?react'
import { useGetLastLogbookTripsQuery } from '../../../api'
import { LogbookMessageType as LogbookMessageTypeEnum, LogbookOperationType, NavigateTo } from '../../../constants'
import { useGetLogbookUseCase } from '../../../hooks/useGetLogbookUseCase'
import { getFAOZonesFromFARMessages } from '../../../utils'
import { CustomDatesShowedInfo } from '../CustomDatesShowedInfo'
import { getLogbookTripSummary, getUniqueGears } from '../utils'

import type { LogbookTripSummary } from '../types'
import type { Promisable } from 'type-fest'

type LogbookSummaryProps = Readonly<{
  navigation: {
    goToLastTrip: () => Promisable<void>
    goToNextTrip: () => Promisable<void>
    goToPreviousTrip: () => Promisable<void>
  }
  showLogbookMessages: (messageType?: string) => Promisable<void>
}>
export function LogbookSummary({ navigation, showLogbookMessages }: LogbookSummaryProps) {
  const dispatch = useMainAppDispatch()
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const fishingActivities = useMainAppSelector(state => state.fishingActivities.fishingActivities)
  const isFirstVoyage = useMainAppSelector(state => state.fishingActivities.isFirstVoyage)
  const isLastVoyage = useMainAppSelector(state => state.fishingActivities.isLastVoyage)
  const tripNumber = useMainAppSelector(state => state.fishingActivities.tripNumber)

  const { data: lastLogbookTrips } = useGetLastLogbookTripsQuery(selectedVessel?.internalReferenceNumber ?? skipToken)

  const getVesselLogbook = useGetLogbookUseCase()

  const getLogbookTrip = useCallback(
    (nextTripNumber: string | undefined) => {
      dispatch(getVesselLogbook(selectedVessel, NavigateTo.EQUALS, true, nextTripNumber))
    },
    [dispatch, getVesselLogbook, selectedVessel]
  )

  const lastLogbookTripsOptions = useMemo(
    () =>
      lastLogbookTrips?.map(trip => ({
        label: `Marée n°${trip}`,
        value: trip
      })) ?? [],
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
          <Zone $isWhite>
            <Title>
              <Text>Segment(s) de flotte(s) actuel(s)</Text>
              <TextValue>
                <FleetSegments segments={selectedVessel?.segments} />
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
            <Title $hasTwoLines={false}>
              <Text hasTwoLines>Résumé du JPE</Text>
              <TextValue data-cy="vessel-fishing-trip-number" hasTwoLines={false}>
                <PreviousTrip
                  data-cy="vessel-fishing-previous-trip"
                  disabled={!!isFirstVoyage}
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
                  value={tripNumber ?? undefined}
                />
                <NextTrip
                  data-cy="vessel-fishing-next-trip"
                  disabled={!!isLastVoyage}
                  onClick={!isLastVoyage ? navigation.goToNextTrip : undefined}
                  title="Marée suivante"
                />
                <LastTrip
                  data-cy="vessel-fishing-last-trip"
                  disabled={!!isLastVoyage}
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
                    isDeleted={logbookTrip.dep.log.isDeleted}
                    isNotAcknowledged={
                      !!logbookTrip.dep.log.acknowledgment && logbookTrip.dep.log.acknowledgment?.isSuccess === false
                    }
                    rejectionCause={logbookTrip.dep.log.acknowledgment?.rejectionCause ?? undefined}
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

                {logbookTrip.cps.logs.length ? (
                  <CPSMessageResume
                    cpsMessages={logbookTrip.cps.logs}
                    hasNoMessageAcknowledged={logbookTrip.cps.areAllMessagesNotAcknowledged}
                    numberOfSpecies={logbookTrip.cps.numberOfSpecies}
                    showLogbookMessages={showLogbookMessages}
                  />
                ) : (
                  <EmptyResume messageType={LogbookMessageTypeEnum.CPS.code.toString()} />
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

                {logbookTrip.lan.log ? (
                  <LANMessageResume
                    catchesOverToleranceAlert={catchesOverToleranceAlert}
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
`

const Text = styled.div<{
  hasTwoLines?: boolean
}>`
  color: ${p => p.theme.color.slateGray};
  font-size: 13px;
  font-weight: 500;
  padding-top: ${p => (p.hasTwoLines ? '5px' : '0')};
`

const TextValue = styled.div<{
  hasTwoLines?: boolean
}>`
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  margin: 0;
  padding-left: 20px;
  padding-top: ${p => (p.hasTwoLines ? '6px' : '0')};

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
  padding: 10px 10px 1px 10px;
`

const TableBody = styled.tbody``

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

const Zone = styled.div<{
  $isWhite?: boolean
}>`
  background: ${p => (p.$isWhite ? p.theme.color.white : 'unset')};
  display: flex;
  flex-wrap: wrap;
  text-align: left;
  margin-bottom: 10px;
`

const Fields = styled.table`
  display: table;
  margin: 15px 5px 10px 35px;
  min-width: 40%;
  width: inherit;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${p => p.theme.color.slateGray};
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
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
`
