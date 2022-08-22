import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FlexboxGrid, List } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { getAlertNameFromType } from '../../../domain/entities/alerts'
import { resetFocusOnAlert } from '../../../domain/shared_slices/Alert'
import silenceAlert from '../../../domain/use_cases/alert/silenceAlert'
import { getTextForSearch } from '../../../utils'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import PendingAlertRow from './PendingAlertRow'
import SilenceAlertMenu from './SilenceAlertMenu'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param alerts
 * @param numberOfSilencedAlerts
 * @param seaFront
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
function PendingAlertsList({ alerts, baseRef, numberOfSilencedAlerts, seaFront }) {
  const dispatch = useDispatch()
  const { focusOnAlert } = useSelector(state => state.alert)
  const baseUrl = window.location.origin
  const [sortColumn] = useState('creationDate')
  const [sortType] = useState(SortType.DESC)
  const [searched, setSearched] = useState(undefined)
  const [showSilencedAlertForIndex, setShowSilencedAlertForIndex] = useState(null)
  const [silencedAlertId, setSilencedAlertId] = useState(null)
  const scrollableContainer = useRef()

  const filteredAlerts = useMemo(() => {
    if (!alerts) {
      return []
    }

    if (!searched?.length || searched?.length <= 1) {
      return alerts
    }

    if (searched?.length > 1) {
      return alerts.filter(
        alert =>
          getTextForSearch(getAlertNameFromType(alert.type)).includes(getTextForSearch(searched)) ||
          getTextForSearch(alert.vesselName).includes(getTextForSearch(searched)) ||
          getTextForSearch(alert.internalReferenceNumber).includes(getTextForSearch(searched)) ||
          getTextForSearch(alert.externalReferenceNumber).includes(getTextForSearch(searched)) ||
          getTextForSearch(alert.ircs).includes(getTextForSearch(searched)),
      )
    }
  }, [alerts, searched])

  const sortedAlerts = useMemo(() => {
    if (!filteredAlerts) {
      return []
    }

    return filteredAlerts.slice().sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
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

  const silenceAlertCallback = useCallback(
    (silencedAlertPeriod, id) => {
      setShowSilencedAlertForIndex(null)
      setSilencedAlertId(null)
      dispatch(silenceAlert(silencedAlertPeriod, id))
    },
    [dispatch],
  )

  return (
    <Content style={contentStyle}>
      <Title style={titleStyle}>ALERTES AUTOMATIQUES À VÉRIFIER</Title>
      {numberOfSilencedAlerts ? (
        <NumberOfSilencedAlerts
          data-cy="side-window-alerts-number-silenced-vessels"
          style={numberOfSilencedAlertsStyle}
        >
          <Warning style={warningStyle}>!</Warning>
          Suspension d&apos;alerte sur {numberOfSilencedAlerts} navire{numberOfSilencedAlerts?.length > 1 ? 's' : ''} en{' '}
          {seaFront}
        </NumberOfSilencedAlerts>
      ) : null}
      <SearchVesselInput
        baseUrl={baseUrl}
        data-cy="side-window-alerts-search-vessel"
        onChange={e => setSearched(e.target.value)}
        placeholder="Rechercher un navire ou une alerte"
        style={searchVesselInputStyle(baseUrl)}
        type="text"
        value={searched || ''}
      />
      <List
        data-cy="side-window-alerts-list"
        style={{
          ...rowStyle(sortedAlerts?.length),
          marginTop: 10,
          overflow: 'visible',
        }}
      >
        <List.Item
          key={0}
          index={0}
          style={{
            ...listItemStyle,
            background: COLORS.background,
            border: `1px solid ${COLORS.lightGray}`,
            color: COLORS.slateGray,
          }}
        >
          <FlexboxGrid>
            <FlexboxGrid.Item style={timeAgoColumnStyle}>Ouverte il y a...</FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={7} sortable style={alertTypeStyle}>
              Titre
            </FlexboxGrid.Item>
            <FlexboxGrid.Item sortable style={alertNatinfStyle}>
              NATINF
            </FlexboxGrid.Item>
            <FlexboxGrid.Item sortable style={vesselNameColumnStyle}>
              Navire
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </List.Item>
        <ScrollableContainer ref={scrollableContainer} className="smooth-scroll" style={ScrollableContainerStyle}>
          {sortedAlerts.map((alert, index) => (
            <PendingAlertRow
              key={alert.id}
              alert={alert}
              index={index}
              setShowSilencedAlertForIndex={setShowSilencedAlertForIndex}
              setSilencedAlertId={setSilencedAlertId}
              showSilencedAlertForIndex={showSilencedAlertForIndex}
            />
          ))}
        </ScrollableContainer>
        {showSilencedAlertForIndex ? (
          <SilenceAlertMenu
            baseRef={baseRef}
            id={silencedAlertId}
            scrollableContainer={scrollableContainer}
            setShowSilencedAlertForIndex={setShowSilencedAlertForIndex}
            showSilencedAlertForIndex={showSilencedAlertForIndex}
            silenceAlert={silenceAlertCallback}
          />
        ) : null}
        {!sortedAlerts?.length ? <NoAlerts style={noAlertsStyle}>Aucune alerte à vérifier</NoAlerts> : null}
      </List>
    </Content>
  )
}

const Warning = styled.span``
const warningStyle = {
  background: COLORS.yellowMunsell,
  borderRadius: 15,
  color: COLORS.charcoal,
  display: 'inline-block',
  font: 'normal normal bold 10px/11px Arial',
  height: 5,
  lineHeight: '7px',
  marginRight: 5,
  padding: '5px 4px 5px 6px',
  width: 5,
}

const NumberOfSilencedAlerts = styled.div``
const numberOfSilencedAlertsStyle = {
  color: COLORS.slateGray,
  marginBottom: 15,
  textDecoration: 'underline',
}

const Title = styled.div``
const titleStyle = {
  color: COLORS.gunMetal,
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 20,
}

const searchVesselInputStyle = baseUrl => ({
  backgroundColor: 'white',
  backgroundImage: `url(${baseUrl}/${SearchIconSVG})`,
  backgroundPosition: 'bottom 3px right 5px',
  border: `1px ${COLORS.lightGray} solid`,
  ':hover, :focus': {
    borderBottom: `1px ${COLORS.lightGray} solid`,
  },
  borderRadius: 0,
  backgroundRepeat: 'no-repeat',
  color: COLORS.gunMetal,
  backgroundSize: 25,
  fontSize: 13,
  flex: 3,
  marginBottom: 5,
  height: 40,
  padding: '0 5px 0 10px',
  width: 280,
})

const ScrollableContainer = styled.div``
const ScrollableContainerStyle = {
  maxHeight: '50vh',
  overflowY: 'auto',
}

const NoAlerts = styled.div``
const noAlertsStyle = {
  color: COLORS.slateGray,
  marginTop: 20,
  textAlign: 'center',
}

const SearchVesselInput = styled.input``

const listItemStyle = (isFocused, toClose) => ({
  animation: toClose ? 'close-alert-transition-item 3s ease forwards' : 'unset',
  background: isFocused ? COLORS.gainsboro : COLORS.cultured,
  border: `1px solid ${COLORS.lightGray}`,
  borderRadius: 1,
  height: 15,
  marginTop: 6,
  overflow: 'hidden',
  transition: 'background 3s',
})

const styleCenter = {
  alignItems: 'center',
  display: 'flex',
  height: 15,
}

// The width of the scrolling bar is 16 px. When we have more than
// 9 items, the scrolling bar is showed
const rowStyle = numberOfAlerts => ({
  boxShadow: 'unset',
  color: COLORS.gunMetal,
  fontWeight: 500,
  width: numberOfAlerts > 9 ? 1180 + 16 : 1180,
})

const vesselNameColumnStyle = {
  ...styleCenter,
  display: 'flex',
  width: 280,
}

const timeAgoColumnStyle = {
  ...styleCenter,
  marginLeft: 20,
  width: 190,
}

const alertTypeStyle = {
  ...styleCenter,
  width: 410,
}

const alertNatinfStyle = {
  ...styleCenter,
  width: 150,
}

const Content = styled.div``
const contentStyle = {
  background: COLORS.gainsboro,
  marginLeft: 40,
  marginTop: 20,
  padding: '30px 40px 40px 40px',
  width: 'fit-content',
}

export default PendingAlertsList
