import Fuse from 'fuse.js'
import countries from 'i18n-iso-countries'
import { useCallback, useMemo, useState } from 'react'
import { FlexboxGrid, List } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { PENDING_ALERTS_SEARCH_OPTIONS } from './constants'
import { getAlertNameFromType } from './utils'
import { COLORS } from '../../../constants/constants'
import { reactivateSilencedAlert } from '../../../domain/use_cases/alert/reactivateSilencedAlert'
import { showVessel } from '../../../domain/use_cases/vessel/showVessel'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { getDateTime } from '../../../utils'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { Flag } from '../../VesselList/tableCells'
import { sortArrayByColumn, SortType } from '../../VesselList/tableSort'

import type { LEGACY_SilencedAlert } from '../../../domain/entities/alerts/types'
import type { CSSProperties } from 'react'

export type SilencedAlertsListProps = {
  silencedAlerts: LEGACY_SilencedAlert[]
}
/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 */
export function SilencedAlertsList({ silencedAlerts }: SilencedAlertsListProps) {
  const dispatch = useMainAppDispatch()
  const { focusedPendingAlertId } = useMainAppSelector(state => state.alert)
  const baseUrl = window.location.origin
  const [sortColumn] = useState('silencedBeforeDate')
  const [sortType] = useState(SortType.ASC)
  const [searchQuery, setSearchQuery] = useState<string>()

  const fuse = useMemo(() => new Fuse(silencedAlerts, PENDING_ALERTS_SEARCH_OPTIONS), [silencedAlerts])

  const filteredAlerts = useMemo(() => {
    if (!searchQuery || searchQuery.length <= 1) {
      return silencedAlerts
    }

    return fuse.search(searchQuery).map(result => result.item)
  }, [silencedAlerts, searchQuery, fuse])

  const sortedAlerts = useMemo(
    () => filteredAlerts.slice().sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType)),
    [filteredAlerts, sortColumn, sortType]
  )

  const reactivateSilencedAlertCallback = useCallback(
    (id: string) => {
      dispatch(reactivateSilencedAlert(id))
    },
    [dispatch]
  )

  return (
    <Content style={contentStyle}>
      <Title style={titleStyle}>SUSPENSION D’ALERTES</Title>
      <SearchVesselInput
        data-cy="side-window-silenced-alerts-search-vessel"
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Rechercher un navire ou une alerte"
        style={searchVesselInputStyle(baseUrl)}
        type="text"
        value={searchQuery}
      />
      <List
        data-cy="side-window-silenced-alerts-list"
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
            <FlexboxGrid.Item style={vesselNameColumnStyle}>Navire</FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={7} style={alertTypeStyle}>
              Titre
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={alertNatinfStyle}>NATINF</FlexboxGrid.Item>
            <FlexboxGrid.Item style={ignoredForStyle}>Ignorée pour...</FlexboxGrid.Item>
            <FlexboxGrid.Item style={ignoredForStyle}>Reprise le...</FlexboxGrid.Item>
          </FlexboxGrid>
        </List.Item>
        <ScrollableContainer style={ScrollableContainerStyle}>
          {sortedAlerts.map((alert, index) => (
            <List.Item
              key={alert.id}
              index={index + 1}
              style={listItemStyle(alert.id === focusedPendingAlertId, alert.isReactivated)}
            >
              {alert.isReactivated && (
                <AlertTransition style={alertValidatedTransition}>L’alerte est réactivée</AlertTransition>
              )}
              {!alert.isReactivated && (
                <FlexboxGrid>
                  <FlexboxGrid.Item style={vesselNameColumnStyle}>
                    <Flag
                      rel="preload"
                      src={`${baseUrl ? `${baseUrl}/` : ''}flags/${alert.flagState.toLowerCase()}.svg`}
                      style={{ marginLeft: 0, marginRight: 5, marginTop: 1, width: 18 }}
                      title={countries.getName(alert.flagState.toLowerCase(), 'fr')}
                    />
                    {alert.vesselName}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={alertTypeStyle}>{getAlertNameFromType(alert.value.type)}</FlexboxGrid.Item>
                  <FlexboxGrid.Item style={alertNatinfStyle}>{alert.value.natinfCode}</FlexboxGrid.Item>
                  <FlexboxGrid.Item style={ignoredForStyle}>
                    {timeago.format(alert.silencedBeforeDate, 'fr')}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={ignoredForStyle}>
                    {getDateTime(alert.silencedBeforeDate, true)}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={rowBorderStyle} />
                  <FlexboxGrid.Item style={iconStyle}>
                    <Icon
                      alt="Voir sur la carte"
                      data-cy="side-window-silenced-alerts-show-vessel"
                      onClick={() => {
                        dispatch(showVessel(alert, false, false))
                      }}
                      src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
                      style={showIconStyle}
                      title="Voir sur la carte"
                    />
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={iconStyle}>
                    <Icon
                      alt={"Réactiver l'alerte"}
                      data-cy="side-window-silenced-alerts-delete-silenced-alert"
                      onClick={() => reactivateSilencedAlertCallback(alert.id)}
                      src={`${baseUrl}/Icone_alertes_gris.png`}
                      style={deleteSilencedAlertIconStyle}
                      title={"Réactiver l'alerte"}
                    />
                  </FlexboxGrid.Item>
                </FlexboxGrid>
              )}
            </List.Item>
          ))}
        </ScrollableContainer>
        {!sortedAlerts?.length ? <NoAlerts style={noAlertsStyle}>Aucune alerte suspendue</NoAlerts> : null}
      </List>
    </Content>
  )
}

const AlertTransition = styled.div``

const alertValidatedTransition: CSSProperties = {
  background: '#29B36133 0% 0% no-repeat padding-box',
  color: COLORS.mediumSeaGreen,
  fontWeight: 500,
  height: 41,
  lineHeight: '41px',
  marginTop: -13,
  textAlign: 'center'
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
  maxHeight: 'calc(100vh - 170px)',
  overflowY: 'auto'
}

const NoAlerts = styled.div``
const noAlertsStyle: CSSProperties = {
  color: COLORS.slateGray,
  marginTop: 20,
  textAlign: 'center'
}

const SearchVesselInput = styled.input``

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const showIconStyle: CSSProperties = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 16,
  marginLeft: 'auto',
  paddingRight: 7,
  width: 20
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const Icon = styled.img``
const deleteSilencedAlertIconStyle: CSSProperties = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 18,
  marginLeft: 'auto',
  paddingRight: 10
}

const listItemStyle = (isFocused, toClose) => ({
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
const rowStyle = numberOfAlerts => ({
  boxShadow: 'unset',
  color: COLORS.gunMetal,
  fontWeight: 500,
  width: numberOfAlerts > 9 ? 1260 + 16 : 1260
})

const vesselNameColumnStyle = {
  ...styleCenter,
  display: 'flex',
  marginLeft: 20,
  width: 280
}

const alertTypeStyle = {
  ...styleCenter,
  width: 410
}

const alertNatinfStyle = {
  ...styleCenter,
  width: 150
}

const ignoredForStyle = {
  ...styleCenter,
  width: 150
}

const iconStyle = {
  ...styleCenter,
  marginLeft: 10,
  width: 30
}

const rowBorderStyle = {
  ...styleCenter,
  borderLeft: `1px solid ${COLORS.lightGray}`,
  height: 43,
  marginRight: 5,
  marginTop: -14,
  width: 2
}

const Content = styled.div``
const contentStyle = {
  marginBottom: 20,
  marginTop: 20,
  padding: '30px 40px 40px 10px',
  width: 'fit-content'
}
