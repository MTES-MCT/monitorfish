import { COLORS } from '@constants/constants'
import { NO_SEAFRONT_GROUP, type NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { sortArrayByColumn, SortType } from '@features/Vessel/components/VesselList/tableSort'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { CustomSearch, ExclamationPoint, THEME } from '@mtes-mct/monitor-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlexboxGrid, List } from 'rsuite'
import styled from 'styled-components'

import { PendingAlertRow } from './PendingAlertRow'
import { SilenceAlertMenu } from './SilenceAlertMenu'
import { getAlertNameFromType } from './utils'
import { silenceAlert } from '../../../../../domain/use_cases/alert/silenceAlert'
import SearchIconSVG from '../../../../icons/Loupe_dark.svg?react'
import { ALERTS_MENU_SEAFRONT_TO_SEAFRONTS } from '../../../constants'
import { SUB_MENU_LABEL } from '../constants'
import { resetFocusOnPendingAlert } from '../slice'

import type { SilencedAlertPeriodRequest } from '../../../types'
import type { CSSProperties, MutableRefObject, RefObject } from 'react'

export type PendingAlertsListProps = Readonly<{
  baseRef: RefObject<HTMLDivElement>
  numberOfSilencedAlerts: number
  selectedSeafrontGroup: SeafrontGroup | NoSeafrontGroup
}>
/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 */
export function PendingAlertsList({ baseRef, numberOfSilencedAlerts, selectedSeafrontGroup }: PendingAlertsListProps) {
  const dispatch = useMainAppDispatch()
  const focusedPendingAlertId = useMainAppSelector(state => state.alert.focusedPendingAlertId)
  const pendingAlerts = useMainAppSelector(state => state.alert.pendingAlerts)
  const baseUrl = window.location.origin
  const [searchQuery, setSearchQuery] = useState<string>()
  const [showSilencedAlertForIndex, setShowSilencedAlertForIndex] = useState<number>()
  const [silencedAlertId, setSilencedAlertId] = useState<string>()
  const scrollableContainerRef = useRef() as MutableRefObject<HTMLDivElement>

  const sortColumn = 'creationDate'
  const sortType = SortType.DESC

  const currentSeafrontAlerts = useMemo(() => {
    if (selectedSeafrontGroup === NO_SEAFRONT_GROUP) {
      return pendingAlerts.filter(pendingAlert => !pendingAlert.value.seaFront)
    }

    return pendingAlerts.filter(
      pendingAlert =>
        pendingAlert.value.seaFront &&
        (ALERTS_MENU_SEAFRONT_TO_SEAFRONTS[selectedSeafrontGroup].seafronts || []).includes(pendingAlert.value.seaFront)
    )
  }, [pendingAlerts, selectedSeafrontGroup])
  const numberOfAlertsMessage = useMemo(
    () =>
      `Suspension d’alerte sur ${numberOfSilencedAlerts} navire${numberOfSilencedAlerts > 1 ? 's' : ''} en ${
        SUB_MENU_LABEL[selectedSeafrontGroup]
      }`,
    [numberOfSilencedAlerts, selectedSeafrontGroup]
  )

  const fuse = useMemo(
    () =>
      new CustomSearch(
        currentSeafrontAlerts,
        [
          'vesselName',
          'internalReferenceNumber',
          'externalReferenceNumber',
          'ircs',
          {
            getFn: alert => getAlertNameFromType(alert.value.type),
            name: ['value', 'type']
          }
        ],
        { threshold: 0.4 }
      ),
    [currentSeafrontAlerts]
  )

  const filteredAlerts = useMemo(() => {
    if (!currentSeafrontAlerts) {
      return []
    }

    if (!searchQuery || searchQuery.length <= 1) {
      return currentSeafrontAlerts
    }

    return fuse.find(searchQuery)
  }, [currentSeafrontAlerts, searchQuery, fuse])

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
          <StyledExclamationPoint color={THEME.color.white} size={15}>
            !
          </StyledExclamationPoint>
          {numberOfAlertsMessage}
        </NumberOfSilencedAlerts>
      )}
      <SearchVesselInput
        data-cy="side-window-alerts-search-vessel"
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Rechercher un navire ou une alerte"
        style={searchVesselInputStyle(baseUrl)}
        type="text"
        value={searchQuery ?? ''}
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

const StyledExclamationPoint = styled(ExclamationPoint)`
  margin-right: 5px;
`

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
  height: 42,
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
