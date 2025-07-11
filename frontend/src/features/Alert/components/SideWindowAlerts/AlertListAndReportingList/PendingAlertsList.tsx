import { COLORS } from '@constants/constants'
import { NO_SEAFRONT_GROUP, type NoSeafrontGroup, SeafrontGroup } from '@constants/seafront'
import { silenceAlert } from '@features/Alert/useCases/silenceAlert'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { CustomSearch, Icon, Link, pluralize, Size, Tag, TextInput, THEME } from '@mtes-mct/monitor-ui'
import { sortArrayByColumn, SortType } from '@utils/sortArrayByColumn'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlexboxGrid, List } from 'rsuite'
import styled from 'styled-components'

import { PendingAlertRow } from './PendingAlertRow'
import { SilenceAlertMenu } from './SilenceAlertMenu'
import { getAlertNameFromType } from './utils'
import { ALERTS_MENU_SEAFRONT_TO_SEAFRONTS } from '../../../constants'
import { AdditionalSubMenu, SUB_MENU_LABEL } from '../constants'
import { resetFocusOnPendingAlert, setSubMenu } from '../slice'

import type { PendingAlert, SilencedAlertPeriodRequest } from '../../../types'
import type { CSSProperties, MutableRefObject, RefObject } from 'react'

export type PendingAlertsListProps = Readonly<{
  baseRef: RefObject<HTMLDivElement>
  numberOfSilencedAlerts: number
  selectedSeafrontGroup: SeafrontGroup | NoSeafrontGroup
}>
export function PendingAlertsList({ baseRef, numberOfSilencedAlerts, selectedSeafrontGroup }: PendingAlertsListProps) {
  const dispatch = useMainAppDispatch()
  const focusedPendingAlertId = useMainAppSelector(state => state.alert.focusedPendingAlertId)
  const pendingAlerts = useMainAppSelector(state => state.alert.pendingAlerts)
  const [searchQuery, setSearchQuery] = useState<string>()
  const [silenceAlertMenuDisplayedFor, setSilenceAlertMenuDisplayedFor] = useState<
    { index: number; pendingAlert: PendingAlert } | undefined
  >()
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
  const numberOfAlertsMessage = `${numberOfSilencedAlerts} ${pluralize('suspension', numberOfSilencedAlerts)} d'${pluralize('alerte', numberOfSilencedAlerts)} en ${
    SUB_MENU_LABEL[selectedSeafrontGroup]
  }`

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
    (silencedAlertPeriodRequest: SilencedAlertPeriodRequest, pendingAlert: PendingAlert) => {
      setSilenceAlertMenuDisplayedFor(undefined)
      dispatch(silenceAlert(silencedAlertPeriodRequest, pendingAlert))
    },
    [dispatch]
  )

  return (
    <Content>
      <StyledTextInput
        data-cy="side-window-alerts-search-vessel"
        isLabelHidden
        isSearchInput
        isTransparent
        label="Rechercher un navire ou une alerte"
        name="searchQuery"
        onChange={setSearchQuery}
        placeholder="Rechercher un navire ou une alerte"
        size={Size.LARGE}
        value={searchQuery}
      />
      <Row>
        <NumberOfAlerts>{filteredAlerts.length} alertes</NumberOfAlerts>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <StyledLink onClick={() => dispatch(setSubMenu(AdditionalSubMenu.ALERT_RULES))}>
          {' '}
          (en savoir plus sur le fonctionnement des alertes)
        </StyledLink>
        {numberOfSilencedAlerts > 0 && (
          <StyledTagInfo
            backgroundColor={THEME.color.gainsboro}
            color={THEME.color.charcoal}
            Icon={Icon.Info}
            iconColor={THEME.color.goldenPoppy}
            withCircleIcon
          >
            {numberOfAlertsMessage}
          </StyledTagInfo>
        )}
      </Row>
      {/** TODO Use table from monitor-ui */}
      <List
        data-cy="side-window-alerts-list"
        style={{
          ...rowStyle(sortedAlerts?.length),
          marginTop: 8,
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
              setSilenceAlertMenuDisplayedFor={setSilenceAlertMenuDisplayedFor}
              silencedAlertMenuDisplayedOnIndex={silenceAlertMenuDisplayedFor?.index}
            />
          ))}
        </ScrollableContainer>
        {!!silenceAlertMenuDisplayedFor && (
          <SilenceAlertMenu
            baseRef={baseRef}
            pendingAlert={silenceAlertMenuDisplayedFor.pendingAlert}
            pendingAlertIndex={silenceAlertMenuDisplayedFor.index}
            scrollableContainer={scrollableContainerRef}
            setSilenceAlertMenuDisplayedFor={setSilenceAlertMenuDisplayedFor}
            silenceAlert={silenceAlertCallback}
          />
        )}
        {!sortedAlerts.length && <NoAlerts style={noAlertsStyle}>Aucune alerte à vérifier</NoAlerts>}
      </List>
    </Content>
  )
}

const NumberOfAlerts = styled.span`
  font-weight: 500;
`

const StyledLink = styled(Link)`
  margin-left: 4px;
  cursor: pointer;
`

const StyledTagInfo = styled(Tag)`
  margin-right: 0;
  margin-left: auto;
  font-weight: 500;
`

const StyledTextInput = styled(TextInput)`
  width: 310px;
`

const Row = styled.div`
  margin-top: 28px;
  display: flex;
`

const ScrollableContainer = styled.div``
const ScrollableContainerStyle: CSSProperties = {
  maxHeight: '70vh',
  overflowY: 'auto'
}

const NoAlerts = styled.div``
const noAlertsStyle: CSSProperties = {
  color: COLORS.slateGray,
  marginTop: 20,
  textAlign: 'center'
}

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

const Content = styled.div`
  padding: 32px 32px 32px 32px;
  width: fit-content;
`
