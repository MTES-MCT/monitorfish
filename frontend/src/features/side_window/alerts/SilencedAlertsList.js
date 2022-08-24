import countries from 'i18n-iso-countries'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FlexboxGrid, List } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { COLORS } from '../../../constants/constants'
import { getAlertNameFromType } from '../../../domain/entities/alerts'
import reactivateSilencedAlert from '../../../domain/use_cases/alert/reactivateSilencedAlert'
import getVesselVoyage from '../../../domain/use_cases/vessel/getVesselVoyage'
import showVessel from '../../../domain/use_cases/vessel/showVessel'
import { getDateDiffInDays, getDateTime, getTextForSearch } from '../../../utils'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { Flag } from '../../vessel_list/tableCells'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param silencedAlerts
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
function SilencedAlertsList({ silencedAlerts }) {
  const dispatch = useDispatch()
  const { focusOnAlert } = useSelector(state => state.alert)
  const baseUrl = window.location.origin
  const [sortedAlerts, setSortedAlerts] = useState([])
  const [sortColumn] = useState('silencedBeforeDate')
  const [sortType] = useState(SortType.ASC)
  const [filteredAlerts, setFilteredAlerts] = useState([])
  const [searched, setSearched] = useState(undefined)

  useEffect(() => {
    if (filteredAlerts) {
      const sortedAlerts = filteredAlerts.slice().sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))

      setSortedAlerts(sortedAlerts)
    }
  }, [filteredAlerts, sortColumn, sortType])

  useEffect(() => {
    if (!silencedAlerts) {
      return
    }

    if (!searched?.length || searched?.length <= 1) {
      setFilteredAlerts(silencedAlerts)

      return
    }

    if (searched?.length > 1) {
      const nextFilteredAlerts = silencedAlerts.filter(
        alert =>
          getTextForSearch(getAlertNameFromType(alert.type)).includes(getTextForSearch(searched)) ||
          getTextForSearch(alert.vesselName).includes(getTextForSearch(searched)) ||
          getTextForSearch(alert.internalReferenceNumber).includes(getTextForSearch(searched)) ||
          getTextForSearch(alert.externalReferenceNumber).includes(getTextForSearch(searched)) ||
          getTextForSearch(alert.ircs).includes(getTextForSearch(searched)),
      )
      setFilteredAlerts(nextFilteredAlerts)
    }
  }, [silencedAlerts, searched])

  const reactivateSilencedAlertCallback = useCallback(
    id => {
      dispatch(reactivateSilencedAlert(id))
    },
    [dispatch],
  )

  return (
    <Content style={contentStyle}>
      <Title style={titleStyle}>SUSPENSION D&apos;ALERTES</Title>
      <SearchVesselInput
        baseUrl={baseUrl}
        data-cy="side-window-silenced-alerts-search-vessel"
        onChange={e => setSearched(e.target.value)}
        placeholder="Rechercher un navire ou une alerte"
        style={searchVesselInputStyle(baseUrl)}
        type="text"
        value={searched}
      />
      <List
        data-cy="side-window-silenced-alerts-list"
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
              style={listItemStyle(focusOnAlert ? alert.id === focusOnAlert?.id : false, alert.isReactivated)}
            >
              {alert.isReactivated ? (
                <AlertTransition style={alertValidatedTransition}>L&apos;alerte est réactivée</AlertTransition>
              ) : null}
              {!alert.isReactivated ? (
                <FlexboxGrid>
                  <FlexboxGrid.Item style={vesselNameColumnStyle}>
                    <Flag
                      rel="preload"
                      src={`${baseUrl ? `${baseUrl}/` : ''}flags/${alert.flagState}.svg`}
                      style={{ marginLeft: 0, marginRight: 5, marginTop: 1, width: 18 }}
                      title={countries.getName(alert.flagState, 'fr')}
                    />
                    {alert.vesselName}
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item style={alertTypeStyle}>{getAlertNameFromType(alert.type)}</FlexboxGrid.Item>
                  <FlexboxGrid.Item style={alertNatinfStyle}>{alert.natinfCode}</FlexboxGrid.Item>
                  <FlexboxGrid.Item style={ignoredForStyle}>
                    {alert.silencedAfterDate
                      ? new Date(alert.silencedAfterDate) > new Date()
                        ? `${getDateDiffInDays(
                            new Date(alert.silencedAfterDate),
                            new Date(alert.silencedBeforeDate),
                          )} jours`
                        : timeago.format(alert.silencedBeforeDate, 'fr')
                      : timeago.format(alert.silencedBeforeDate, 'fr')}
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
                        const vesselIdentity = { ...alert }
                        dispatch(showVessel(vesselIdentity, false, false, null))
                        dispatch(getVesselVoyage(vesselIdentity, null, false))
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
              ) : null}
            </List.Item>
          ))}
        </ScrollableContainer>
        {!sortedAlerts?.length ? <NoAlerts style={noAlertsStyle}>Aucune alerte suspendue</NoAlerts> : null}
      </List>
    </Content>
  )
}

const AlertTransition = styled.div``

const alertValidatedTransition = {
  background: '#29B36133 0% 0% no-repeat padding-box',
  color: COLORS.mediumSeaGreen,
  fontWeight: 500,
  height: 41,
  lineHeight: '41px',
  marginTop: -13,
  textAlign: 'center',
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
  border: `1px ${COLORS.lightGray} solid`,
  backgroundPosition: 'bottom 3px right 5px',
  borderRadius: 0,
  ':hover, :focus': {
    borderBottom: `1px ${COLORS.lightGray} solid`,
  },
  color: COLORS.gunMetal,
  backgroundRepeat: 'no-repeat',
  fontSize: 13,
  backgroundSize: 25,
  marginBottom: 5,
  flex: 3,
  height: 40,
  padding: '0 5px 0 10px',
  width: 280,
})

const ScrollableContainer = styled.div``
const ScrollableContainerStyle = {
  maxHeight: 'calc(100vh - 170px)',
  overflowY: 'auto',
}

const NoAlerts = styled.div``
const noAlertsStyle = {
  color: COLORS.slateGray,
  marginTop: 20,
  textAlign: 'center',
}

const SearchVesselInput = styled.input``

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const showIconStyle = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 16,
  marginLeft: 'auto',
  paddingRight: 7,
  width: 20,
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const Icon = styled.img``
const deleteSilencedAlertIconStyle = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 18,
  marginLeft: 'auto',
  paddingRight: 10,
}

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
  width: numberOfAlerts > 9 ? 1260 + 16 : 1260,
})

const vesselNameColumnStyle = {
  ...styleCenter,
  display: 'flex',
  marginLeft: 20,
  width: 280,
}

const alertTypeStyle = {
  ...styleCenter,
  width: 410,
}

const alertNatinfStyle = {
  ...styleCenter,
  width: 150,
}

const ignoredForStyle = {
  ...styleCenter,
  width: 150,
}

const iconStyle = {
  ...styleCenter,
  marginLeft: 10,
  width: 30,
}

const rowBorderStyle = {
  ...styleCenter,
  borderLeft: `1px solid ${COLORS.lightGray}`,
  height: 43,
  marginRight: 5,
  marginTop: -14,
  width: 2,
}

const Content = styled.div``
const contentStyle = {
  marginBottom: 20,
  marginTop: 20,
  padding: '30px 40px 40px 40px',
  width: 'fit-content',
}

export default SilencedAlertsList
