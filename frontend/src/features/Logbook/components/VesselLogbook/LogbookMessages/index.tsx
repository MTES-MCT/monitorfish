import { THEME, type Option } from '@mtes-mct/monitor-ui'
import { ExportToCsv } from 'export-to-csv'
import { useEffect, useState } from 'react'
import Select from 'react-select'
import makeAnimated from 'react-select/animated'
import styled from 'styled-components'

import { LogbookMessage } from './LogbookMessage'
import { COLORS } from '../../../../../constants/constants'
import { useMainAppSelector } from '../../../../../hooks/useMainAppSelector'
import { getDate } from '../../../../../utils'
import { formatAsCSVColumns } from '../../../../../utils/formatAsCSVColumns'
import SortSVG from '../../../../icons/ascendant-descendant.svg?react'
import DownloadMessagesSVG from '../../../../icons/Bouton_exporter_piste_navire_dark.svg?react'
import ArrowLastTripSVG from '../../../../icons/Double_fleche_navigation_marees.svg?react'
import ArrowTripSVG from '../../../../icons/Fleche_navigation_marees.svg?react'
import ArrowSVG from '../../../../icons/Picto_fleche-pleine-droite.svg?react'
import { CustomDatesShowedInfo } from '../CustomDatesShowedInfo'

import type { LogbookMessage as LogbookMessageType } from '../../../Logbook.types'
import type { Promisable } from 'type-fest'

const animatedComponents = makeAnimated()

const messageTypeSelectOptions = [
  { label: 'DEP', value: 'DEP' },
  { label: 'COE', value: 'COE' },
  { label: 'CRO', value: 'CRO' },
  { label: 'COX', value: 'COX' },
  { label: 'FAR', value: 'FAR' },
  { label: 'INS', value: 'INS' },
  { label: 'DIS/DIM', value: 'DIS' },
  { label: 'EOF', value: 'EOF' },
  { label: 'PNO', value: 'PNO' },
  { label: 'RTP', value: 'RTP' },
  { label: 'LAN', value: 'LAN' }
]

const optionsCSV = {
  decimalSeparator: '.',
  fieldSeparator: ',',
  quoteStrings: '"',
  showLabels: true,
  showTitle: false,
  useBom: true,
  useKeysAsHeaders: true,
  useTextFile: false
}

const csvExporter = new ExportToCsv(optionsCSV)

// These properties are ordered for the CSV column order
const downloadMessagesOptions = {
  dateTime: {
    code: 'operationDateTime',
    name: 'Date'
  },
  messageType: {
    code: 'messageType',
    name: 'Type'
  },
  rawMessage: {
    code: 'rawMessage',
    name: 'Message'
  },
  tripNumber: {
    code: 'tripNumber',
    name: 'Marée n°'
  }
}

type LogbookMessagesProps = {
  messageTypeFilter: string | undefined
  navigation: {
    goToLastTrip: () => Promisable<void>
    goToNextTrip: () => Promisable<void>
    goToPreviousTrip: () => Promisable<void>
  }
  showFishingActivitiesSummary: () => void
}
export function LogbookMessages({ messageTypeFilter, navigation, showFishingActivitiesSummary }: LogbookMessagesProps) {
  const fishingActivities = useMainAppSelector(state => state.fishingActivities.fishingActivities)
  const isFirstVoyage = useMainAppSelector(state => state.fishingActivities.isFirstVoyage)
  const isLastVoyage = useMainAppSelector(state => state.fishingActivities.isLastVoyage)
  const tripNumber = useMainAppSelector(state => state.fishingActivities.tripNumber)

  /** @type {LogbookMessage[]} logbookMessages */
  const [logbookMessages, setLogbookMessages] = useState<LogbookMessageType[]>([])
  const [ascendingSort, setAscendingSort] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState<Option[] | null>(null)

  useEffect(() => {
    if (fishingActivities?.logbookMessages) {
      setLogbookMessages(fishingActivities.logbookMessages)
    }
  }, [fishingActivities])

  useEffect(() => {
    const messageTypes = messageTypeSelectOptions.filter(options => options.value === messageTypeFilter)
    setSelectedOptions(messageTypes)
  }, [messageTypeFilter])

  const inverseSort = () => {
    const inversedSort = !ascendingSort

    // TODO Fix these ts-ignore.
    const sortedFishingActivities = [...logbookMessages].sort((a, b) => {
      if (inversedSort) {
        // @ts-ignore
        return new Date(a.reportDateTime) - new Date(b.reportDateTime)
      }

      // @ts-ignore
      return new Date(b.reportDateTime) - new Date(a.reportDateTime)
    })

    setAscendingSort(inversedSort)
    setLogbookMessages(sortedFishingActivities)
  }

  // TODO Move this function to a utils file.
  const downloadMessages = () => {
    const objectsToExports = logbookMessages
      .filter(_logbookMessages => filterBySelectedType(_logbookMessages))
      .map(position => formatAsCSVColumns(position, downloadMessagesOptions))

    const date = new Date()
    csvExporter.options.filename = `export_ers_${tripNumber}_${getDate(date.toISOString())}`
    csvExporter.generateCsv(objectsToExports)
  }

  // TODO Move this function to a utils file.
  const selectStyles = {
    clearIndicator: base => ({ ...base, padding: 1, width: 18 }),
    container: provided => ({
      ...provided,
      height: 'fit-content',
      padding: 0,
      width: '-moz-available',
      zIndex: 4
    }),
    control: base => ({ ...base, borderColor: COLORS.lightGray, borderRadius: 'unset', fontSize: 13, minHeight: 26 }),
    dropdownIndicator: base => ({ ...base, padding: 1, width: 18 }),
    input: () => ({ margin: 0, padding: 0 }),
    menu: base => ({ ...base, margin: 0, maxHeight: 360, padding: 0 }),
    menuList: base => ({ ...base, maxHeight: 360 }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    multiValue: base => ({ ...base, background: COLORS.gainsboro, borderRadius: 12, fontSize: 13 }),
    multiValueLabel: base => ({
      ...base,
      background: COLORS.gainsboro,
      borderRadius: 12,
      color: COLORS.slateGray,
      paddingBottom: 1,
      paddingTop: 2
    }),
    multiValueRemove: base => ({
      ...base,
      '&:hover': {
        backgroundColor: THEME.color.blueYonder25,
        color: THEME.color.blueYonder
      },
      background: COLORS.gainsboro,
      borderRadius: 12,
      color: THEME.color.slateGray
    }),
    option: base => ({ ...base, fontSize: 13 }),
    placeholder: base => ({ ...base, fontSize: 13 }),
    singleValue: base => ({ ...base, fontSize: 13 }),
    valueContainer: base => ({ ...base, fontSize: 13, minWidth: 130, padding: '0px 2px' })
  }

  // TODO Move this function to a utils file.
  const filterBySelectedType = (logbookMessage: LogbookMessageType) => {
    if (selectedOptions?.length) {
      return selectedOptions.some(messageType => logbookMessage.messageType === messageType.value)
    }

    return true
  }

  return (
    <Wrapper>
      <Arrow onClick={() => showFishingActivitiesSummary()} />
      <Previous onClick={() => showFishingActivitiesSummary()}>Revenir au résumé</Previous>
      <Filters>
        <Select
          className="available-width"
          closeMenuOnSelect
          components={animatedComponents}
          defaultValue={selectedOptions}
          isMulti
          isSearchable={false}
          menuPortalTarget={document.body}
          onChange={setSelectedOptions as any}
          options={messageTypeSelectOptions}
          placeholder="Filtrer les messages"
          styles={selectStyles}
          value={selectedOptions}
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
        <DownloadMessages onClick={downloadMessages} title="Télécharger tous les messages" />
        <InverseDate ascendingSort={ascendingSort} onClick={inverseSort} title="Trier par date de saisie" />
      </Filters>
      <CustomDatesShowedInfoWithMargin>
        <CustomDatesShowedInfo width={460} />
      </CustomDatesShowedInfoWithMargin>
      {logbookMessages?.length ? (
        logbookMessages
          .filter(logbookMessage => filterBySelectedType(logbookMessage))
          .map((message, index) => <LogbookMessage key={message.reportId} isFirst={index === 0} message={message} />)
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
  ascendingSort: boolean
}>`
  border: 1px solid ${p => p.theme.color.lightGray};
  width: 37px;
  height: 14px;
  padding: 6px;
  margin-left: auto;
  cursor: pointer;
  ${p => (p.ascendingSort ? 'transform: rotate(180deg);' : null)}
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
