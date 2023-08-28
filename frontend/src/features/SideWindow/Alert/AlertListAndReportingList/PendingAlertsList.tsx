import { THEME } from '@mtes-mct/monitor-ui'
import Fuse from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlexboxGrid, List } from 'rsuite'
import styled from 'styled-components'

import { PENDING_ALERTS_SEARCH_OPTIONS } from './constants'
import { PendingAlertRow } from './PendingAlertRow'
import { SilenceAlertMenu } from './SilenceAlertMenu'
import { COLORS } from '../../../../constants/constants'
import { ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS } from '../../../../domain/entities/alerts/constants'
import { SeaFrontGroup } from '../../../../domain/entities/seaFront/constants'
import { silenceAlert } from '../../../../domain/use_cases/alert/silenceAlert'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import SearchIconSVG from '../../../icons/Loupe_dark.svg'
import { sortArrayByColumn, SortType } from '../../../VesselList/tableSort'
import { AlertSubMenuLabel } from '../constants'
import { resetFocusOnPendingAlert } from '../slice'

import type { SilencedAlertPeriodRequest } from '../../../../domain/entities/alerts/types'
import type { CSSProperties, MutableRefObject, RefObject } from 'react'

export type PendingAlertsListProps = {
  baseRef: RefObject<HTMLDivElement>
  numberOfSilencedAlerts: number
  selectedSeaFront: SeaFrontGroup
}
/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 */
export function PendingAlertsList({ baseRef, numberOfSilencedAlerts, selectedSeaFront }: PendingAlertsListProps) {
  const dispatch = useMainAppDispatch()
  const { focusedPendingAlertId, pendingAlerts } = useMainAppSelector(state => state.alert)
  const baseUrl = window.location.origin
  const [sortColumn] = useState('creationDate')
  const [sortType] = useState(SortType.DESC)
  const [searchQuery, setSearchQuery] = useState<string>()
  const [showSilencedAlertForIndex, setShowSilencedAlertForIndex] = useState<number>()
  const [silencedAlertId, setSilencedAlertId] = useState<string>()
  const scrollableContainerRef = useRef() as MutableRefObject<HTMLDivElement>

  const currentSeaFrontAlerts = useMemo(
    () =>
      pendingAlerts.filter(pendingAlert =>
        (ALERTS_MENU_SEA_FRONT_TO_SEA_FRONTS[selectedSeaFront].seaFronts || []).includes(pendingAlert.value.seaFront)
      ),
    [pendingAlerts, selectedSeaFront]
  )
  const numberOfAlertsMessage = useMemo(
    () =>
      `Suspension d’alerte sur ${numberOfSilencedAlerts} navire${numberOfSilencedAlerts > 1 ? 's' : ''} en ${
        AlertSubMenuLabel[selectedSeaFront]
      }`,
    [numberOfSilencedAlerts, selectedSeaFront]
  )

  const fuse = useMemo(() => new Fuse(currentSeaFrontAlerts, PENDING_ALERTS_SEARCH_OPTIONS), [currentSeaFrontAlerts])

  const filteredAlerts = useMemo(() => {
    if (!currentSeaFrontAlerts) {
      return []
    }

    if (!searchQuery || searchQuery.length <= 1) {
      return currentSeaFrontAlerts
    }

    return fuse.search(searchQuery).map(result => result.item)
  }, [currentSeaFrontAlerts, searchQuery, fuse])

  const sortedAlerts = useMemo(() => {
    if (!filteredAlerts) {
      return []
    }

    return filteredAlerts.slice().sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
  }, [filteredAlerts, sortColumn, sortType])

  useEffect(() => {
    if (focusedPendingAlertId) {
      setSearchQuery(undefined)
      const timeoutHandler = setTimeout(() => {
        dispatch(resetFocusOnPendingAlert())
      }, 2000)

      return () => {
        clearTimeout(timeoutHandler)
      }
    }

    return undefined
  }, [dispatch, focusedPendingAlertId])

  const silenceAlertCallback = useCallback(
    (silencedAlertPeriodRequest: SilencedAlertPeriodRequest, id: string) => {
      setShowSilencedAlertForIndex(undefined)
      setSilencedAlertId(undefined)
      dispatch(silenceAlert(silencedAlertPeriodRequest, id))
    },
    [dispatch]
  )

  return (
    <Content style={contentStyle}>
      <Title style={titleStyle}>ALERTES AUTOMATIQUES À VÉRIFIER</Title>
      {numberOfSilencedAlerts > 0 && (
        <NumberOfSilencedAlerts
          data-cy="side-window-alerts-number-silenced-vessels"
          style={numberOfSilencedAlertsStyle}
        >
          <Warning style={warningStyle}>!</Warning>
          {numberOfAlertsMessage}
        </NumberOfSilencedAlerts>
      )}
      <SearchVesselInput
        data-cy="side-window-alerts-search-vessel"
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Rechercher un navire ou une alerte"
        style={searchVesselInputStyle(baseUrl)}
        type="text"
        value={searchQuery || ''}
      />
      <List
        data-cy="side-window-alerts-list"
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
            background: COLORS.white,
            border: `1px solid ${COLORS.lightGray}`,
            color: COLORS.slateGray
          }}
        >
          <FlexboxGrid>
            <FlexboxGrid.Item style={timeAgoColumnStyle}>Ouverte il y a...</FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={7} style={alertTypeStyle}>
              Titre
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={alertNatinfStyle}>NATINF</FlexboxGrid.Item>
            <FlexboxGrid.Item style={vesselNameColumnStyle}>Navire</FlexboxGrid.Item>
          </FlexboxGrid>
        </List.Item>
        <ScrollableContainer ref={scrollableContainerRef} className="smooth-scroll" style={ScrollableContainerStyle}>
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
        {showSilencedAlertForIndex && silencedAlertId && (
          <SilenceAlertMenu
            baseRef={baseRef}
            id={silencedAlertId}
            scrollableContainer={scrollableContainerRef}
            setShowSilencedAlertForIndex={setShowSilencedAlertForIndex}
            showSilencedAlertForIndex={showSilencedAlertForIndex}
            silenceAlert={silenceAlertCallback}
          />
        )}
        {!sortedAlerts.length && <NoAlerts style={noAlertsStyle}>Aucune alerte à vérifier</NoAlerts>}
      </List>
    </Content>
  )
}

const Warning = styled.span``
const warningStyle = {
  background: THEME.color.goldenPoppy,
  borderRadius: 15,
  color: COLORS.charcoal,
  display: 'inline-block',
  font: 'normal normal bold 10px/11px Arial',
  height: 5,
  lineHeight: '7px',
  marginRight: 5,
  padding: '5px 4px 5px 6px',
  width: 5
}

const NumberOfSilencedAlerts = styled.div``
const numberOfSilencedAlertsStyle = {
  color: COLORS.slateGray,
  marginBottom: 15,
  textDecoration: 'underline'
}

const Title = styled.div``
const titleStyle = {
  color: COLORS.gunMetal,
  fontSize: 16,
  fontWeight: 700,
  marginBottom: 20
}

const searchVesselInputStyle = baseUrl => ({
  ':hover, :focus': {
    borderBottom: `1px ${COLORS.lightGray} solid`
  },
  backgroundColor: 'white',
  backgroundImage: `url(${baseUrl}${SearchIconSVG})`,
  backgroundPosition: 'bottom 3px right 5px',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 25,
  border: `1px ${COLORS.lightGray} solid`,
  borderRadius: 0,
  color: COLORS.gunMetal,
  flex: 3,
  fontSize: 13,
  height: 40,
  marginBottom: 5,
  padding: '0 5px 0 10px',
  width: 280
})

const ScrollableContainer = styled.div``
const ScrollableContainerStyle: CSSProperties = {
  maxHeight: '50vh',
  overflowY: 'auto'
}

const NoAlerts = styled.div``
const noAlertsStyle: CSSProperties = {
  color: COLORS.slateGray,
  marginTop: 20,
  textAlign: 'center'
}

const SearchVesselInput = styled.input``

const listItemStyle = (isFocused: boolean, toClose: boolean): CSSProperties => ({
  animation: toClose ? 'close-alert-transition-item 3s ease forwards' : 'unset',
  background: isFocused ? COLORS.gainsboro : COLORS.cultured,
  border: `1px solid ${COLORS.lightGray}`,
  borderRadius: 1,
  height: 15,
  marginTop: 6,
  overflow: 'hidden',
  transition: 'background 3s'
})

const styleCenter = {
  alignItems: 'center',
  display: 'flex',
  height: 15
}

// The width of the scrolling bar is 16 px. When we have more than
// 9 items, the scrolling bar is showed
const rowStyle = (numberOfAlerts: number): CSSProperties => ({
  boxShadow: 'unset',
  color: COLORS.gunMetal,
  fontWeight: 500,
  width: numberOfAlerts > 9 ? 1180 + 16 : 1180
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
  background: COLORS.gainsboro,
  marginLeft: 10,
  padding: '30px 40px 40px 40px',
  width: 'fit-content'
}
