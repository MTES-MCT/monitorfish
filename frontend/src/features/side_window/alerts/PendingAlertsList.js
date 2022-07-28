import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import { useDispatch, useSelector } from 'react-redux'
import { FlexboxGrid, List } from 'rsuite'
import { AlertsMenuSeaFrontsToSeaFrontList, getAlertNameFromType } from '../../../domain/entities/alerts'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { getTextForSearch } from '../../../utils'
import { resetFocusOnAlert } from '../../../domain/shared_slices/Alert'
import SilenceAlertMenu from './SilenceAlertMenu'
import silenceAlert from '../../../domain/use_cases/alert/silenceAlert'
import PendingAlertRow from './PendingAlertRow'
import { getAlertForList } from './dataFormatting'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param alerts
 * @param numberOfSilencedAlerts
 * @param seaFront
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
const PendingAlertsList = ({ numberOfSilencedAlerts, seaFront, baseRef }) => {
  const dispatch = useDispatch()
  const {
    focusOnAlert,
    alerts
  } = useSelector(state => state.alert)
  const baseUrl = window.location.origin
  const [sortColumn] = useState('creationDate')
  const [sortType] = useState(SortType.DESC)
  const [searched, setSearched] = useState(undefined)
  const [showSilencedAlertForIndex, setShowSilencedAlertForIndex] = useState(null)
  const [silencedAlertId, setSilencedAlertId] = useState(null)
  const scrollableContainer = useRef()

  const currentSeaFrontAlerts = useMemo(() => {
    return alerts
      .filter(alert =>
        (AlertsMenuSeaFrontsToSeaFrontList[seaFront.code]?.seaFronts || []).includes(alert.value.seaFront))
  }, [alerts, seaFront])

  const filteredAlerts = useMemo(() => {
    if (!alerts) {
      return []
    }

    if (!searched?.length || searched?.length <= 1) {
      return alerts
    }

    if (searched?.length > 1) {
      return alerts.filter(alert =>
        getTextForSearch(getAlertNameFromType(alert.value.type)).includes(getTextForSearch(searched)) ||
        getTextForSearch(alert.vesselName).includes(getTextForSearch(searched)) ||
        getTextForSearch(alert.internalReferenceNumber).includes(getTextForSearch(searched)) ||
        getTextForSearch(alert.externalReferenceNumber).includes(getTextForSearch(searched)) ||
        getTextForSearch(alert.ircs).includes(getTextForSearch(searched)))
    }
  }, [currentSeaFrontAlerts, searched])

  const sortedAlerts = useMemo(() => {
    if (!filteredAlerts) {
      return []
    }

    return filteredAlerts
      .slice()
      .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
  }, [filteredAlerts, sortColumn, sortType])

  useEffect(() => {
    if (focusOnAlert) {
      setSearched(undefined)
      const timeoutHandler = setTimeout(() => {
        dispatch(resetFocusOnAlert())
      }, 2000)

      return () => {
        clearTimeout(timeoutHandler)
      }
    }
  }, [focusOnAlert])

  const silenceAlertCallback = useCallback((silencedAlertPeriod, id) => {
    setShowSilencedAlertForIndex(null)
    setSilencedAlertId(null)
    dispatch(silenceAlert(silencedAlertPeriod, id))
  }, [dispatch])

  return <Content style={contentStyle}>
    <Title style={titleStyle}>
      ALERTES AUTOMATIQUES À VÉRIFIER
    </Title>
    {
      numberOfSilencedAlerts
        ? <NumberOfSilencedAlerts
          style={numberOfSilencedAlertsStyle}
          data-cy={'side-window-alerts-number-silenced-vessels'}
        >
          <Warning style={warningStyle}>!</Warning>
          Suspension d&apos;alerte sur {numberOfSilencedAlerts} navire{numberOfSilencedAlerts?.length > 1 ? 's' : ''} en {seaFront.name}
        </NumberOfSilencedAlerts>
        : null
    }
    <SearchVesselInput
      style={searchVesselInputStyle(baseUrl)}
      baseUrl={baseUrl}
      data-cy={'side-window-alerts-search-vessel'}
      placeholder={'Rechercher un navire ou une alerte'}
      type="text"
      value={searched || ''}
      onChange={e => setSearched(e.target.value)}/>
      <List
        data-cy={'side-window-alerts-list'}
        style={{
          ...rowStyle(sortedAlerts?.length),
          marginTop: 10,
          overflow: 'visible'
        }}
      >
        <List.Item
          key={0}
          index={0}
          style={{
            ...listItemStyle,
            border: `1px solid ${COLORS.lightGray}`,
            background: COLORS.background,
            color: COLORS.slateGray
          }}
        >
          <FlexboxGrid>
            <FlexboxGrid.Item style={timeAgoColumnStyle}>
              Ouverte il y a...
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={7} style={alertTypeStyle} sortable>
              Titre
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={alertNatinfStyle} sortable>
              NATINF
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={vesselNameColumnStyle} sortable>
              Navire
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </List.Item>
        <ScrollableContainer
          ref={scrollableContainer}
          className={'smooth-scroll'}
          style={ScrollableContainerStyle}
        >
          {sortedAlerts.map((alert, index) => (
            <PendingAlertRow
              key={alert.id}
              alert={alert}
              index={index}
              showSilencedAlertForIndex={showSilencedAlertForIndex}
              setShowSilencedAlertForIndex={setShowSilencedAlertForIndex}
              setSilencedAlertId={setSilencedAlertId}
            />
          ))}
        </ScrollableContainer>
        {
          showSilencedAlertForIndex
            ? <SilenceAlertMenu
              id={silencedAlertId}
              showSilencedAlertForIndex={showSilencedAlertForIndex}
              setShowSilencedAlertForIndex={setShowSilencedAlertForIndex}
              silenceAlert={silenceAlertCallback}
              baseRef={baseRef}
              scrollableContainer={scrollableContainer}
            />
            : null
        }
        {
          !sortedAlerts?.length
            ? <NoAlerts style={noAlertsStyle}>Aucune alerte à vérifier</NoAlerts>
            : null
        }
    </List>
  </Content>
}

const Warning = styled.span``
const warningStyle = {
  font: 'normal normal bold 10px/11px Arial',
  color: COLORS.charcoal,
  background: COLORS.yellowMunsell,
  borderRadius: 15,
  height: 5,
  width: 5,
  padding: '5px 4px 5px 6px',
  lineHeight: '7px',
  display: 'inline-block',
  marginRight: 5
}

const NumberOfSilencedAlerts = styled.div``
const numberOfSilencedAlertsStyle = {
  color: COLORS.slateGray,
  textDecoration: 'underline',
  marginBottom: 15
}

const Title = styled.div``
const titleStyle = {
  fontWeight: 700,
  fontSize: 16,
  color: COLORS.gunMetal,
  marginBottom: 20
}

const searchVesselInputStyle = baseUrl => ({
  marginBottom: 5,
  backgroundColor: 'white',
  border: `1px ${COLORS.lightGray} solid`,
  borderRadius: 0,
  color: COLORS.gunMetal,
  fontSize: 13,
  height: 40,
  width: 280,
  padding: '0 5px 0 10px',
  flex: 3,
  backgroundImage: `url(${baseUrl}/${SearchIconSVG})`,
  backgroundSize: 25,
  backgroundPosition: 'bottom 3px right 5px',
  backgroundRepeat: 'no-repeat',
  ':hover, :focus': {
    borderBottom: `1px ${COLORS.lightGray} solid`
  }
})

const ScrollableContainer = styled.div``
const ScrollableContainerStyle = {
  overflowY: 'auto',
  maxHeight: '50vh'
}

const NoAlerts = styled.div``
const noAlertsStyle = {
  textAlign: 'center',
  color: COLORS.slateGray,
  marginTop: 20
}

const SearchVesselInput = styled.input``

const listItemStyle = (isFocused, toClose) => ({
  background: isFocused ? COLORS.gainsboro : COLORS.cultured,
  border: `1px solid ${COLORS.lightGray}`,
  borderRadius: 1,
  height: 15,
  marginTop: 6,
  transition: 'background 3s',
  animation: toClose ? 'close-alert-transition-item 3s ease forwards' : 'unset',
  overflow: 'hidden'
})

const styleCenter = {
  display: 'flex',
  alignItems: 'center',
  height: 15
}

// The width of the scrolling bar is 16 px. When we have more than
// 9 items, the scrolling bar is showed
const rowStyle = numberOfAlerts => ({
  width: numberOfAlerts > 9 ? 1180 + 16 : 1180,
  fontWeight: 500,
  color: COLORS.gunMetal,
  boxShadow: 'unset'
})

const vesselNameColumnStyle = {
  ...styleCenter,
  display: 'flex',
  width: 280
}

const timeAgoColumnStyle = {
  ...styleCenter,
  marginLeft: 20,
  width: 190
}

const alertTypeStyle = {
  ...styleCenter,
  width: 410
}

const alertNatinfStyle = {
  ...styleCenter,
  width: 150
}

const Content = styled.div``
const contentStyle = {
  width: 'fit-content',
  padding: '30px 40px 40px 40px',
  marginLeft: 40,
  marginTop: 20,
  background: COLORS.gainsboro
}

export default PendingAlertsList
