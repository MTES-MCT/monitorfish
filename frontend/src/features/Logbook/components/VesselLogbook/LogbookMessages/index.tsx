import { useEffect, useMemo, useState } from 'react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import styled from 'styled-components'

import { LogbookMessage } from './messages/LogbookMessage'
import { FilterMessagesStyle } from './styles'
import { downloadMessages, filterBySelectedType } from './utils'
import { FishingActivitiesTab } from '../../../../../domain/entities/vessel/vessel'
import { useMainAppDispatch } from '../../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import SortSVG from '../../../../icons/ascendant-descendant.svg?react'
import DownloadMessagesSVG from '../../../../icons/Bouton_exporter_piste_navire_dark.svg?react'
import ArrowLastTripSVG from '../../../../icons/Double_fleche_navigation_marees.svg?react'
import ArrowTripSVG from '../../../../icons/Fleche_navigation_marees.svg?react'
import ArrowSVG from '../../../../icons/Picto_fleche-pleine-droite.svg?react'
import { logbookActions } from '../../../slice'
import { CustomDatesShowedInfo } from '../CustomDatesShowedInfo'
import { getLogbookMessagesTypeOptions } from '../utils'

import type { Option } from '@mtes-mct/monitor-ui'
import type { Promisable } from 'type-fest'

const animatedComponents = makeAnimated()

type LogbookMessagesProps = Readonly<{
  messageTypeFilter: string | undefined
  navigation: {
    goToLastTrip: () => Promisable<void>
    goToNextTrip: () => Promisable<void>
    goToPreviousTrip: () => Promisable<void>
  }
}>
export function LogbookMessages({ messageTypeFilter, navigation }: LogbookMessagesProps) {
  const dispatch = useMainAppDispatch()
  const fishingActivities = useMainAppSelector(state => state.fishingActivities.fishingActivities)
  const isFirstVoyage = useMainAppSelector(state => state.fishingActivities.isFirstVoyage)
  const isLastVoyage = useMainAppSelector(state => state.fishingActivities.isLastVoyage)
  const tripNumber = useMainAppSelector(state => state.fishingActivities.tripNumber)

  const [isAscendingSort, setIsAscendingSort] = useState(true)
  const [filteredMessagesTypes, setFilteredMessagesTypes] = useState<Option[] | undefined>(undefined)

  const filteredAndSortedLogbookMessages = useMemo(() => {
    if (!fishingActivities?.logbookMessages) {
      return []
    }

    const filteredLogbookMessages = fishingActivities.logbookMessages.filter(logbookMessage =>
      filterBySelectedType(logbookMessage, filteredMessagesTypes)
    )

    return [...filteredLogbookMessages].sort((a, b) => {
      if (isAscendingSort) {
        return a.reportDateTime && b.reportDateTime && a.reportDateTime > b.reportDateTime ? 1 : -1
      }

      return a.reportDateTime && b.reportDateTime && a.reportDateTime > b.reportDateTime ? -1 : 1
    })
  }, [fishingActivities?.logbookMessages, isAscendingSort, filteredMessagesTypes])

  useEffect(() => {
    const messageTypes = getLogbookMessagesTypeOptions().filter(options => options.value === messageTypeFilter)

    setFilteredMessagesTypes(messageTypes)
  }, [messageTypeFilter])

  const showSummary = () => dispatch(logbookActions.setTab(FishingActivitiesTab.SUMMARY))

  return (
    <Wrapper>
      <Arrow onClick={showSummary} />
      <Previous onClick={showSummary}>Revenir au résumé</Previous>
      <Filters>
        <Select
          className="available-width"
          closeMenuOnSelect
          components={animatedComponents}
          defaultValue={filteredMessagesTypes}
          isMulti
          isSearchable={false}
          menuPortalTarget={document.body}
          onChange={setFilteredMessagesTypes as any}
          options={getLogbookMessagesTypeOptions()}
          placeholder="Filtrer les messages"
          styles={FilterMessagesStyle}
          value={filteredMessagesTypes}
        />
        <Navigation>
          <PreviousTrip
            disabled={isFirstVoyage}
            onClick={!isFirstVoyage ? navigation.goToPreviousTrip : undefined}
            title="Marée précédente"
          />
          {tripNumber ? `Marée n°${tripNumber}` : '-'}
          <LastTrip
            disabled={isLastVoyage}
            onClick={!isLastVoyage ? navigation.goToNextTrip : undefined}
            title="Dernière marée"
          />
          <NextTrip
            disabled={isLastVoyage}
            onClick={!isLastVoyage ? navigation.goToNextTrip : undefined}
            title="Marée suivante"
          />
        </Navigation>
        <DownloadMessages
          onClick={() => downloadMessages(filteredAndSortedLogbookMessages, tripNumber)}
          title="Télécharger tous les messages"
        />
        <InverseDate
          $ascendingSort={isAscendingSort}
          onClick={() => setIsAscendingSort(!isAscendingSort)}
          title="Trier par date de saisie"
        />
      </Filters>
      <CustomDatesShowedInfoWithMargin>
        <CustomDatesShowedInfo width={460} />
      </CustomDatesShowedInfoWithMargin>
      {filteredAndSortedLogbookMessages.length ? (
        filteredAndSortedLogbookMessages.map((message, index) => (
          <LogbookMessage key={message.reportId} isFirst={index === 0} logbookMessage={message} />
        ))
      ) : (
        <NoMessage>Aucun message reçu</NoMessage>
      )}
    </Wrapper>
  )
}

const CustomDatesShowedInfoWithMargin = styled.div`
  margin-bottom: 8px;
`

const PreviousTrip = styled(ArrowTripSVG)<{
  disabled: boolean
}>`
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: sub;
  width: 14px;
  margin-right: 10px;
  transform: rotate(180deg);
  float: left;
  margin: 2px 0 0 5px;
`

const NextTrip = styled(ArrowTripSVG)<{
  disabled: boolean
}>`
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: sub;
  width: 14px;
  margin-left: 10px;
  float: right;
  margin: 2px 5px 0 0;
`

const LastTrip = styled(ArrowLastTripSVG)<{
  disabled: boolean
}>`
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: sub;
  width: 14px;
  margin-left: 5px;
  float: right;
  margin: 2px 5px 0 0;
`

const Navigation = styled.div`
  width: -moz-available; /* For Mozilla */
  width: -webkit-fill-available; /* For Chrome */
  width: stretch;
  padding: 0 0 0 10px;
  text-align: center;
  font-size: 13px;
  color: ${p => p.theme.color.slateGray};
  padding: 3px 2px 2px 2px;
  max-width: 250px;
  margin: 0 10px 0 10px;
  border: 1px solid ${p => p.theme.color.lightGray};
`

const InverseDate = styled(SortSVG)<{
  $ascendingSort: boolean
}>`
  border: 1px solid ${p => p.theme.color.lightGray};
  width: 37px;
  height: 14px;
  padding: 6px;
  margin-left: auto;
  cursor: pointer;
  ${p => (p.$ascendingSort ? 'transform: rotate(180deg);' : null)}
`

const DownloadMessages = styled(DownloadMessagesSVG)`
  border: 1px solid ${p => p.theme.color.lightGray};
  width: 66px;
  height: 26px;
  margin-left: auto;
  margin-right: 10px;
  cursor: pointer;
`

const Filters = styled.div`
  display: flex;
  margin-top: 8px;
  margin-bottom: 8px;

  #react-select-3-input {
    height: 26px;
  }
`

const Arrow = styled(ArrowSVG)`
  vertical-align: sub;
  transform: rotate(180deg);
  margin-right: 5px;
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
