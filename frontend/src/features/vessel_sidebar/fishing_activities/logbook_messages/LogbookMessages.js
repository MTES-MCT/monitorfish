import { ExportToCsv } from 'export-to-csv'
import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import LogbookMessage from './LogbookMessage'
import { ReactComponent as SortSVG } from '../../../icons/ascendant-descendant.svg'
import { ReactComponent as ArrowSVG } from '../../../icons/Picto_fleche-pleine-droite.svg'
import { ReactComponent as ArrowTripSVG } from '../../../icons/Fleche_navigation_marees.svg'
import { ReactComponent as ArrowLastTripSVG } from '../../../icons/Double_fleche_navigation_marees.svg'
import { ReactComponent as DownloadMessagesSVG } from '../../../icons/Bouton_exporter_piste_navire_dark.svg'
import makeAnimated from 'react-select/animated'
import { useSelector } from 'react-redux'

import { formatToCSVColumnsForExport, getDate } from '../../../../utils'
import CustomDatesShowedInfo from '../CustomDatesShowedInfo'

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
  { label: 'LAN', value: 'LAN' },
]

const optionsCSV = {
  decimalSeparator: '.',
  fieldSeparator: ',',
  quoteStrings: '"',
  showLabels: true,
  showTitle: false,
  useBom: true,
  useKeysAsHeaders: true,
  useTextFile: false,
}

const csvExporter = new ExportToCsv(optionsCSV)

// These properties are ordered for the CSV column order
const downloadMessagesOptions = {
  dateTime: {
    code: 'operationDateTime',
    name: 'Date',
  },
  messageType: {
    code: 'messageType',
    name: 'Type',
  },
  tripNumber: {
    code: 'tripNumber',
    name: 'Marée n°'
  },
  rawMessage: {
    code: 'rawMessage',
    name: 'Message',
  },
}

function LogbookMessages({ messageTypeFilter, navigation, showFishingActivitiesSummary }) {
  const { isLastVoyage, isFirstVoyage, tripNumber, fishingActivities } = useSelector(state => state.fishingActivities)

  /** @type {LogbookMessage[]} logbookMessages */
  const [logbookMessages, setLogbookMessages] = useState([])
  const [ascendingSort, setAscendingSort] = useState(true)
  const [selectedOptions, setSelectedOptions] = useState(null)

  useEffect(() => {
    if (fishingActivities?.logbookMessages) {
      setLogbookMessages(fishingActivities.logbookMessages)
    }
  }, [fishingActivities])

  useEffect(() => {
    const messageTypes = messageTypeSelectOptions.filter(options => options.value === messageTypeFilter)
    setSelectedOptions(messageTypes)
  }, [messageTypeFilter])

  function inverseSort() {
    const inversedSort = !ascendingSort

    const sortedFishingActivities = [...logbookMessages].sort((a, b) => {
      if (inversedSort) {
        return new Date(a.reportDateTime) - new Date(b.reportDateTime)
      } 
        return new Date(b.reportDateTime) - new Date(a.reportDateTime)
      
    })

    setAscendingSort(inversedSort)
    setLogbookMessages(sortedFishingActivities)
  }

  function downloadMessages() {
    const objectsToExports = logbookMessages
      .filter(logbookMessages => filterBySelectedType(logbookMessages))
      .map(position => formatToCSVColumnsForExport(position, downloadMessagesOptions))

    const date = new Date()
    csvExporter.options.filename = `export_ers_${tripNumber}_${getDate(date.toISOString())}`
    csvExporter.generateCsv(objectsToExports)
  }

  const selectStyles = {
    container: (provided, state) => ({
      ...provided,
      height: 'fit-content',
      padding: 0,
      width: '-moz-available',
      zIndex: 4
    }),
    control: base => ({ ...base, fontSize: 13, minHeight: 26, borderColor: COLORS.lightGray, borderRadius: 'unset' }),
    menu: base => ({ ...base, margin: 0, padding: 0, maxHeight: 360 }),
    option: base => ({ ...base, fontSize: 13 }),
    input: base => ({ padding: 0, margin: 0 }),
    menuList: base => ({ ...base, maxHeight: 360 }),
    clearIndicator: base => ({ ...base, padding: 1, width: 18 }),
    dropdownIndicator: base => ({ ...base, padding: 1, width: 18 }),
    multiValue: base => ({ ...base, fontSize: 13, borderRadius: 12, background: COLORS.gainsboro }),
    valueContainer: base => ({ ...base, minWidth: 130, fontSize: 13, padding: '0px 2px' }),
    multiValueLabel: base => ({
      ...base,
      paddingBottom: 1,
      paddingTop: 2,
      background: COLORS.gainsboro,
      borderRadius: 12,
      color: COLORS.slateGray
    }),
    multiValueRemove: base => ({
      ...base,
      background: COLORS.gainsboro,
      borderRadius: 12,
      color: COLORS.lightGray,
      '&:hover': {
        backgroundColor: COLORS.lightGray,
        color: COLORS.grayDarkerTwo,
      },
    }),
    placeholder: base => ({ ...base, fontSize: 13 }),
    menuPortal: base => ({ ...base, zIndex: 9999 }),
    singleValue: base => ({ ...base, fontSize: 13 })
  }

  function filterBySelectedType (logbookMessage) {
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
          menuPortalTarget={document.body}
          placeholder="Filtrer les messages"
          closeMenuOnSelect
          components={animatedComponents}
          defaultValue={selectedOptions}
          value={selectedOptions}
          onChange={setSelectedOptions}
          isMulti
          options={messageTypeSelectOptions}
          styles={selectStyles}
          isSearchable={false}
          className="available-width"
        />
        <Navigation selectedOptionsSize={selectedOptions ? selectedOptions.length : 0}>
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
        <DownloadMessages title={'Télécharger tous les messages'} onClick={downloadMessages} />
        <InverseDate title={'Trier par date de saisie'} ascendingSort={ascendingSort} onClick={inverseSort} />
      </Filters>
      <CustomDatesShowedInfoWithMargin>
        <CustomDatesShowedInfo width={460} />
      </CustomDatesShowedInfoWithMargin>
      {logbookMessages?.length ? (
        logbookMessages
          .filter(logbookMessage => filterBySelectedType(logbookMessage))
          .map((message, index) => <LogbookMessage
            key={message.reportId}
            message={message}
            isFirst={index === 0}
          />)
        <NoMessage>Aucun message reçu</NoMessage>
      )}
    </Wrapper>
  )
}

const CustomDatesShowedInfoWithMargin = styled.div`
  margin-bottom: 8px;
`

const PreviousTrip = styled(ArrowTripSVG)`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: sub;
  width: 14px;
  margin-right: 10px;
  transform: rotate(180deg);
  float: left;
  margin: 2px 0 0 5px;
`

const NextTrip = styled(ArrowTripSVG)`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: sub;
  width: 14px;
  margin-left: 10px;
  float: right;
  margin: 2px 5px 0 0;
`

const LastTrip = styled(ArrowLastTripSVG)`
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  vertical-align: sub;
  width: 14px;
  margin-left: 5px;
  float: right;
  margin: 2px 5px 0 0;
`

const Navigation = styled.div`
  width: -moz-available;          /* For Mozilla */
  width: -webkit-fill-available;  /* For Chrome */
  width: stretch;
  padding: 0 0 0 10px;
  text-align: center;
  font-size: 13px;
  color: ${COLORS.slateGray};
  padding: 3px 2px 2px 2px;
  max-width: 250px;
  margin: 0 10px 0 10px;
  border: 1px solid ${COLORS.lightGray};
}
`

const InverseDate = styled(SortSVG)`
  border: 1px solid ${COLORS.lightGray};
  width: 37px;
  height: 14px;
  padding: 6px;
  margin-left: auto;
  cursor: pointer;
  ${props => (props.ascendingSort ? 'transform: rotate(180deg);' : null)}
`

const DownloadMessages = styled(DownloadMessagesSVG)`
  border: 1px solid ${COLORS.lightGray};
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
  color: ${COLORS.slateGray};
`

const Wrapper = styled.div`
  text-align: left;
  background: ${COLORS.background};
  padding: 5px 10px 10px 10px;
`

const Previous = styled.a`
  text-align: left;
  text-decoration: underline;
  font-size: 13px;
  color: ${COLORS.slateGray};
  cursor: pointer;
  display: inline-block;
`

export default LogbookMessages
