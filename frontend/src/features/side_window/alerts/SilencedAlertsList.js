import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import { Flag } from '../../vessel_list/tableCells'
import { useDispatch, useSelector } from 'react-redux'
import { FlexboxGrid, List } from 'rsuite'
import countries from 'i18n-iso-countries'
import { getAlertNameFromType } from '../../../domain/entities/alerts'
import showVessel from '../../../domain/use_cases/vessel/showVessel'
import getVesselVoyage from '../../../domain/use_cases/vessel/getVesselVoyage'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { getDateDiffInDays, getDateTime, getTextForSearch } from '../../../utils'
import * as timeago from 'timeago.js'
import reactivateSilencedAlert from '../../../domain/use_cases/alert/reactivateSilencedAlert'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param silencedSeaFrontAlerts
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
const SilencedAlertsList = ({ silencedSeaFrontAlerts }) => {
  const dispatch = useDispatch()
  const {
    focusOnAlert
  } = useSelector(state => state.alert)
  const baseUrl = window.location.origin
  const [sortColumn] = useState('silencedBeforeDate')
  const [sortType] = useState(SortType.ASC)
  const [searched, setSearched] = useState(undefined)

  const filteredAlerts = useMemo(() => {
    if (!searched?.length || searched?.length <= 1) {
      return silencedSeaFrontAlerts
    }

    return silencedSeaFrontAlerts.filter(alert =>
      getTextForSearch(getAlertNameFromType(alert.value.type)).includes(getTextForSearch(searched)) ||
      getTextForSearch(alert.vesselName).includes(getTextForSearch(searched)) ||
      getTextForSearch(alert.internalReferenceNumber).includes(getTextForSearch(searched)) ||
      getTextForSearch(alert.externalReferenceNumber).includes(getTextForSearch(searched)) ||
      getTextForSearch(alert.ircs).includes(getTextForSearch(searched)))
  }, [silencedSeaFrontAlerts, searched])

  const sortedAlerts = useMemo(() => {
    return filteredAlerts
      .slice()
      .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))
  }, [filteredAlerts, sortColumn, sortType])

  const reactivateSilencedAlertCallback = useCallback(id => {
    dispatch(reactivateSilencedAlert(id))
  }, [dispatch])

  return <Content style={contentStyle}>
    <Title style={titleStyle}>
      SUSPENSION D&apos;ALERTES
    </Title>
    <SearchVesselInput
      style={searchVesselInputStyle(baseUrl)}
      baseUrl={baseUrl}
      data-cy={'side-window-silenced-alerts-search-vessel'}
      placeholder={'Rechercher un navire ou une alerte'}
      type="text"
      value={searched}
      onChange={e => setSearched(e.target.value)}/>
      <List
        data-cy={'side-window-silenced-alerts-list'}
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
            <FlexboxGrid.Item style={vesselNameColumnStyle}>
              Navire
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={7} style={alertTypeStyle}>
              Titre
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={alertNatinfStyle}>
              NATINF
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={ignoredForStyle}>
              Ignorée pour...
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={ignoredForStyle}>
              Reprise le...
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </List.Item>
        <ScrollableContainer style={ScrollableContainerStyle}>
          {sortedAlerts.map((alert, index) => (
            <List.Item
              key={alert.id}
              index={index + 1}
              style={listItemStyle(focusOnAlert
                ? alert.id === focusOnAlert?.id
                : false,
              alert.isReactivated)}
            >
              {
                alert.isReactivated
                  ? <AlertTransition style={alertValidatedTransition}>
                    L&apos;alerte est réactivée
                  </AlertTransition>
                  : null
              }
              {
                !alert.isReactivated
                  ? <FlexboxGrid>
                    <FlexboxGrid.Item style={vesselNameColumnStyle}>
                      <Flag
                        title={countries.getName(alert.value.flagState?.toLowerCase(), 'fr')}
                        rel="preload"
                        src={`${baseUrl ? `${baseUrl}/` : ''}flags/${alert.value.flagState?.toLowerCase()}.svg`}
                        style={{ width: 18, marginRight: 5, marginLeft: 0, marginTop: 1 }}
                      />
                      {alert.vesselName}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={alertTypeStyle}>
                      {getAlertNameFromType(alert.type)}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={alertNatinfStyle}>
                      {alert.value.natinfCode}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={ignoredForStyle}>
                      {
                        alert.silencedAfterDate
                          ? new Date(alert.silencedAfterDate) > new Date()
                            ? `${getDateDiffInDays(new Date(alert.silencedAfterDate), new Date(alert.silencedBeforeDate))} jours`
                            : timeago.format(alert.silencedBeforeDate, 'fr')
                          : timeago.format(alert.silencedBeforeDate, 'fr')
                      }
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={ignoredForStyle}>
                      {getDateTime(alert.silencedBeforeDate, true)}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={rowBorderStyle}/>
                    <FlexboxGrid.Item style={iconStyle}>
                      <Icon
                        data-cy={'side-window-silenced-alerts-show-vessel'}
                        style={showIconStyle}
                        alt={'Voir sur la carte'}
                        title={'Voir sur la carte'}
                        onClick={() => {
                          const vesselIdentity = { ...alert }
                          dispatch(showVessel(vesselIdentity, false, false, null))
                          dispatch(getVesselVoyage(vesselIdentity, null, false))
                        }}
                        src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
                      />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={iconStyle}>
                      <Icon
                        data-cy={'side-window-silenced-alerts-delete-silenced-alert'}
                        style={deleteSilencedAlertIconStyle}
                        alt={'Réactiver l\'alerte'}
                        title={'Réactiver l\'alerte'}
                        onClick={() => reactivateSilencedAlertCallback(alert.id)}
                        src={`${baseUrl}/Icone_alertes_gris.png`}
                      />
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                  : null
              }
            </List.Item>
          ))}
        </ScrollableContainer>
        {
          !sortedAlerts?.length
            ? <NoAlerts style={noAlertsStyle}>Aucune alerte suspendue</NoAlerts>
            : null
        }
    </List>
  </Content>
}

const AlertTransition = styled.div``

const alertValidatedTransition = {
  background: '#29B36133 0% 0% no-repeat padding-box',
  color: COLORS.mediumSeaGreen,
  fontWeight: 500,
  height: 41,
  marginTop: -13,
  textAlign: 'center',
  lineHeight: '41px'
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
  maxHeight: 'calc(100vh - 170px)'
}

const NoAlerts = styled.div``
const noAlertsStyle = {
  textAlign: 'center',
  color: COLORS.slateGray,
  marginTop: 20
}

const SearchVesselInput = styled.input``

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const showIconStyle = {
  width: 20,
  paddingRight: 7,
  float: 'right',
  flexShrink: 0,
  cursor: 'pointer',
  marginLeft: 'auto',
  height: 16
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const Icon = styled.img``
const deleteSilencedAlertIconStyle = {
  paddingRight: 10,
  float: 'right',
  flexShrink: 0,
  cursor: 'pointer',
  marginLeft: 'auto',
  height: 18
}

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
  width: numberOfAlerts > 9 ? 1260 + 16 : 1260,
  fontWeight: 500,
  color: COLORS.gunMetal,
  boxShadow: 'unset'
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
  height: 43,
  width: 2,
  borderLeft: `1px solid ${COLORS.lightGray}`,
  marginTop: -14,
  marginRight: 5
}

const Content = styled.div``
const contentStyle = {
  width: 'fit-content',
  padding: '30px 40px 40px 40px',
  marginTop: 20,
  marginBottom: 20
}

export default SilencedAlertsList
