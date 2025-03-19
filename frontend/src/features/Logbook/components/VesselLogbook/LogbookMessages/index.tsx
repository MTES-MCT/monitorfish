import { useGetLastLogbookTripsQuery } from '@features/Logbook/api'
import { LogbookSortKey } from '@features/Logbook/components/VesselLogbook/LogbookMessages/constants'
import { LastTrip, NextTrip, PreviousTrip } from '@features/Logbook/components/VesselLogbook/LogbookSummary'
import { NavigateTo } from '@features/Logbook/constants'
import { FishingActivitiesTab } from '@features/Vessel/types/vessel'
import { updateVesselTrackAndLogbookFromTrip } from '@features/Vessel/useCases/updateVesselTrackAndLogbookFromTrip'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Icon, IconButton, Select } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import { sortBy } from 'lodash-es'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { LogbookMessage } from './messages/LogbookMessage'
import {
  downloadMessages,
  filterBySelectedType,
  getLastLogbookTripsOptions,
  LOGBOOK_SORT_LABELS_AS_OPTIONS
} from './utils'
import { logbookActions } from '../../../slice'
import { CustomDatesShowedInfo } from '../CustomDatesShowedInfo'
import { getLogbookMessagesTypeOptions } from '../utils'

type LogbookMessagesProps = Readonly<{
  messageTypeFilter: string | undefined
}>
export function LogbookMessages({ messageTypeFilter }: LogbookMessagesProps) {
  const dispatch = useMainAppDispatch()
  const selectedVesselIdentity = useMainAppSelector(state => state.vessel.selectedVesselIdentity)
  const fishingActivities = useMainAppSelector(state => state.fishingActivities.fishingActivities)
  const isFirstVoyage = useMainAppSelector(state => state.fishingActivities.isFirstVoyage)
  const isLastVoyage = useMainAppSelector(state => state.fishingActivities.isLastVoyage)
  const tripNumber = useMainAppSelector(state => state.fishingActivities.tripNumber)
  const { data: lastLogbookTrips } = useGetLastLogbookTripsQuery(
    selectedVesselIdentity?.internalReferenceNumber ?? skipToken
  )

  const [isAscendingSort, setIsAscendingSort] = useState(true)
  const [filteredMessagesType, setFilteredMessagesType] = useState<string | undefined>(messageTypeFilter)
  const [orderBy, setOrderBy] = useState<LogbookSortKey>(LogbookSortKey.reportDateTime)
  const lastLogbookTripsOptions = getLastLogbookTripsOptions(lastLogbookTrips, tripNumber)

  const filteredAndSortedLogbookMessages = useMemo(() => {
    if (!fishingActivities?.logbookMessages) {
      return []
    }

    const filteredLogbookMessages = fishingActivities.logbookMessages.filter(logbookMessage =>
      filterBySelectedType(logbookMessage, filteredMessagesType)
    )

    const sorted = sortBy(filteredLogbookMessages, [orderBy])

    if (!isAscendingSort) {
      return sorted.reverse()
    }

    return sorted
  }, [fishingActivities?.logbookMessages, orderBy, isAscendingSort, filteredMessagesType])

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
  const showSummary = () => dispatch(logbookActions.setTab(FishingActivitiesTab.SUMMARY))

  return (
    <Wrapper>
      <Arrow accent={Accent.TERTIARY} Icon={Icon.FilledArrow} iconSize={14} onClick={showSummary} />
      <Previous onClick={showSummary}>Revenir au résumé</Previous>
      <Filters>
        <StyledSelect
          isCleanable
          isLabelHidden
          isTransparent
          label="Filtrer les messages"
          name="Filtrer les messages"
          onChange={nextValue => setFilteredMessagesType(nextValue)}
          options={getLogbookMessagesTypeOptions()}
          placeholder="Filtrer les messages"
          searchable
          value={filteredMessagesType}
        />
        <StyledSelect
          isCleanable={false}
          isLabelHidden
          isTransparent
          label="Trier les messages"
          name="Trier les messages"
          onChange={nextValue => setOrderBy(nextValue as LogbookSortKey)}
          options={LOGBOOK_SORT_LABELS_AS_OPTIONS}
          placeholder="Trier les messages"
          value={orderBy}
        />
        <IconButton
          accent={Accent.SECONDARY}
          Icon={Icon.Download}
          iconSize={18}
          onClick={() => downloadMessages(filteredAndSortedLogbookMessages, tripNumber)}
          title="Télécharger tous les messages"
        />
      </Filters>
      <Filters>
        <StyledPreviousTrip
          $disabled={!!isFirstVoyage}
          accent={Accent.SECONDARY}
          data-cy="vessel-fishing-previous-trip"
          Icon={Icon.Chevron}
          iconSize={20}
          onClick={!isFirstVoyage ? goToPreviousTrip : undefined}
          title="Marée précédente"
        />
        <SelectTrip
          isCleanable={false}
          isLabelHidden
          isTransparent
          label="Numéro de marée"
          name="tripNumber"
          onChange={getLogbookTrip}
          options={lastLogbookTripsOptions}
          searchable
          value={(tripNumber as string) ?? undefined}
        />
        <StyledNextTrip
          $disabled={!!isLastVoyage}
          accent={Accent.SECONDARY}
          Icon={Icon.Chevron}
          iconSize={20}
          onClick={!isLastVoyage ? goToNextTrip : undefined}
          title="Marée suivante"
        />
        <StyledLastTrip
          $disabled={!!isLastVoyage}
          accent={Accent.SECONDARY}
          Icon={Icon.DoubleChevron}
          iconSize={20}
          onClick={!isLastVoyage ? goToLastTrip : undefined}
          title="Dernière marée"
        />
        <InverseDate
          $ascendingSort={isAscendingSort}
          accent={Accent.SECONDARY}
          Icon={Icon.SortSelectedDown}
          iconSize={20}
          onClick={() => setIsAscendingSort(!isAscendingSort)}
          title={`Trier par date ${isAscendingSort ? 'antéchronologique' : 'chronologique'}`}
        />
      </Filters>
      <CustomDatesShowedInfoWithMargin>
        <CustomDatesShowedInfo width={460} />
      </CustomDatesShowedInfoWithMargin>
      {filteredAndSortedLogbookMessages.length ? (
        filteredAndSortedLogbookMessages.map((message, index) => (
          <LogbookMessage key={message.reportId} isFirst={index === 0} logbookMessage={message} withMapControls />
        ))
      ) : (
        <NoMessage>Aucun message reçu</NoMessage>
      )}
    </Wrapper>
  )
}

const StyledPreviousTrip = styled(PreviousTrip)`
  margin-right: 8px;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
`

const StyledNextTrip = styled(NextTrip)`
  margin-left: 8px;
  margin-right: 0;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
`

const StyledLastTrip = styled(LastTrip)`
  margin-left: -1px;
  height: 30px;
  width: 30px;
  flex-shrink: 0;
`

const SelectTrip = styled(Select<string>)`
  width: 375px;
`

const StyledSelect = styled(Select<string>)`
  width: 217px;
  margin-right: 8px;
`

const CustomDatesShowedInfoWithMargin = styled.div`
  margin-bottom: 8px;
`

const InverseDate = styled(IconButton)<{
  $ascendingSort: boolean
}>`
  margin-left: 8px;
  width: 30px;
  height: 30px;
  transform: rotate(${p => (p.$ascendingSort ? 0 : 180)}deg);
  transition: transform 0.5s;
`

const Filters = styled.div`
  display: flex;
  margin-top: 8px;
  margin-bottom: 8px;
`

const Arrow = styled(IconButton)`
  transform: rotate(180deg);
  padding: 0;
`

const NoMessage = styled.div`
  text-align: center;
  margin-top: 40px;
  padding-bottom: 30px;
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
`

const Wrapper = styled.div`
  text-align: left;
  background: ${p => p.theme.color.white};
  padding: 5px 10px 10px 10px;
`

const Previous = styled.a`
  text-align: left;
  text-decoration: underline;
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  cursor: pointer;
  display: inline-block;
`
