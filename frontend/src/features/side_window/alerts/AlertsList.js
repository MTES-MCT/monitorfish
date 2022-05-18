import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { sortArrayByColumn, SortType } from '../../vessel_list/tableSort'
import { Flag } from '../../vessel_list/tableCells'
import { batch, useDispatch, useSelector } from 'react-redux'
import List from 'rsuite/lib/List'
import FlexboxGrid from 'rsuite/lib/FlexboxGrid'
import countries from 'i18n-iso-countries'
import * as timeago from 'timeago.js'
import { getRiskFactorColor } from '../../../domain/entities/riskFactor'
import { RiskFactorBox } from '../../vessel_sidebar/risk_factor/RiskFactorBox'
import { getAlertNameFromType, getIgnoreAlertPeriodText } from '../../../domain/entities/alerts'
import showVessel from '../../../domain/use_cases/vessel/showVessel'
import getVesselVoyage from '../../../domain/use_cases/vessel/getVesselVoyage'
import SearchIconSVG from '../../icons/Loupe_dark.svg'
import { getTextForSearch } from '../../../utils'
import { resetFocusOnAlert } from '../../../domain/shared_slices/Alert'
import IgnoreAlertMenu from './IgnoreAlertMenu'
import ignoreAlert from '../../../domain/use_cases/alert/ignoreAlert'
import validateAlert from '../../../domain/use_cases/alert/validateAlert'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param alerts
 * @param seaFront
 * @param baseRef
 * @return {JSX.Element}
 * @constructor
 */
const AlertsList = ({ alerts, seaFront, baseRef }) => {
  const dispatch = useDispatch()
  const {
    focusOnAlert
  } = useSelector(state => state.alert)
  const baseUrl = window.location.origin
  const [sortedAlerts, setSortedAlerts] = useState([])
  const [sortColumn] = useState('creationDate')
  const [sortType] = useState(SortType.DESC)
  const [filteredAlerts, setFilteredAlerts] = useState([])
  const [searchedVessel, setSearchedVessel] = useState(undefined)
  const [showIgnoreAlertForIndex, setShowIgnoreAlertForIndex] = useState(null)
  const [ignoredAlertId, setIgnoredAlertId] = useState(null)

  useEffect(() => {
    if (focusOnAlert) {
      const timeoutHandler = setTimeout(() => {
        dispatch(resetFocusOnAlert())
      }, 2000)

      return () => {
        clearTimeout(timeoutHandler)
      }
    }
  }, [focusOnAlert])

  useEffect(() => {
    if (filteredAlerts) {
      const sortedAlerts = filteredAlerts
        .slice()
        .sort((a, b) => sortArrayByColumn(a, b, sortColumn, sortType))

      setSortedAlerts(sortedAlerts)
    }
  }, [filteredAlerts, sortColumn, sortType])

  useEffect(() => {
    if (!alerts) {
      return
    }

    if (!searchedVessel?.length || searchedVessel?.length <= 1) {
      setFilteredAlerts(alerts)
      return
    }

    if (searchedVessel?.length > 1) {
      const nextFilteredAlerts = alerts.filter(alert =>
        getTextForSearch(alert.vesselName).includes(getTextForSearch(searchedVessel)) ||
        getTextForSearch(alert.internalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
        getTextForSearch(alert.externalReferenceNumber).includes(getTextForSearch(searchedVessel)) ||
        getTextForSearch(alert.ircs).includes(getTextForSearch(searchedVessel)))
      setFilteredAlerts(nextFilteredAlerts)
    }
  }, [alerts, searchedVessel])

  const ignoreAlertCallback = useCallback((ignoreAlertPeriod, id) => {
    setShowIgnoreAlertForIndex(null)
    setIgnoredAlertId(null)
    dispatch(ignoreAlert(ignoreAlertPeriod, id))
  }, [dispatch])

  const validateAlertCallback = useCallback(id => {
    dispatch(validateAlert(id))
  }, [dispatch])

  return <Content style={contentStyle}>
    <Title style={titleStyle}>
      ALERTES AUTOMATIQUES À VÉRIFIER EN {seaFront}
    </Title>
    <SearchVesselInput
      style={searchVesselInputStyle(baseUrl)}
      baseUrl={baseUrl}
      data-cy={'side-window-alerts-search-vessel'}
      placeholder={'Rechercher un navire en alerte'}
      type="text"
      value={searchedVessel}
      onChange={e => setSearchedVessel(e.target.value)}/>
      <List
        data-cy={'side-window-alerts-list'}
        style={{
          ...rowStyle,
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
            <FlexboxGrid.Item colspan={7} style={alertTypeStyle}>
              Thématique
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={timeAgoColumnStyle}>
              Alerte il y a...
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={vesselNameColumnStyle}>
              Nom du navire
            </FlexboxGrid.Item>
            <FlexboxGrid.Item style={cfrColumnStyle}>
              CFR du navire
            </FlexboxGrid.Item>
            <FlexboxGrid.Item colspan={2} style={riskColumnStyle}>
              Note
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
              alert.ignoredPeriod || alert.isValidated)}
            >
              {
                alert.isValidated
                  ? <AlertTransition style={alertValidatedTransition}>
                    Alerte ajoutée à la fiche du navire
                  </AlertTransition>
                  : null
              }
              {
                alert.ignoredPeriod
                  ? <AlertTransition style={alertIgnoredTransition}>
                    L&apos;alerte sera ignorée {getIgnoreAlertPeriodText(alert.ignoredPeriod)}
                </AlertTransition>
                  : null
              }
              {
                !alert.isValidated && !alert.ignoredPeriod
                  ? <FlexboxGrid>
                    <FlexboxGrid.Item style={alertTypeStyle}>
                      {getAlertNameFromType(alert.type)}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={timeAgoColumnStyle} title={new Date(alert.creationDateTimestamp)}>
                      {timeago.format(alert.creationDateTimestamp, 'fr')}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={vesselNameColumnStyle}>
                      <Flag
                        title={countries.getName(alert.flagState, 'fr')}
                        rel="preload"
                        src={`${baseUrl ? `${baseUrl}/` : ''}flags/${alert.flagState}.svg`}
                        style={{ width: 18, marginRight: 5, marginLeft: 0, marginTop: 1 }}
                      />
                      {alert.vesselName}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={cfrColumnStyle}>
                      {alert.internalReferenceNumber}
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item colspan={2} style={riskColumnStyle}>
                      {
                        alert.riskFactor
                          ? <RiskFactorBox
                            marginRight={5}
                            height={240}
                            isBig={false}
                            color={getRiskFactorColor(alert.riskFactor)}
                          >
                            {parseFloat(alert.riskFactor).toFixed(1)}
                          </RiskFactorBox>
                          : null
                      }
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={iconStyle}>
                      <Icon
                        data-cy={'side-window-alerts-show-vessel'}
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
                        data-cy={'side-window-alerts-validate-alert'}
                        style={validateAlertIconStyle}
                        alt={'Valider l\'alerte'}
                        title={'Valider l\'alerte'}
                        onClick={() => validateAlertCallback(alert.id)}
                        src={`${baseUrl}/Icone_valider_alerte.png`}
                        onMouseOver={e => (e.currentTarget.src = `${baseUrl}/Icone_valider_alerte_pleine.png`)}
                        onMouseOut={e => (e.currentTarget.src = `${baseUrl}/Icone_valider_alerte.png`)}
                      />
                    </FlexboxGrid.Item>
                    <FlexboxGrid.Item style={iconStyle}>
                      <Icon
                        data-cy={'side-window-alerts-ignore-alert'}
                        style={ignoreAlertStyle}
                        alt={'Ignorer l\'alerte'}
                        title={'Ignorer l\'alerte'}
                        onClick={() => {
                          batch(() => {
                            setShowIgnoreAlertForIndex(index + 1)
                            setIgnoredAlertId(alert.id)
                          })
                        }}
                        src={showIgnoreAlertForIndex === index + 1
                          ? `${baseUrl}/Icone_ignorer_alerte_pleine.png`
                          : `${baseUrl}/Icone_ignorer_alerte.png`}
                        onMouseOver={e => (e.currentTarget.src = `${baseUrl}/Icone_ignorer_alerte_pleine.png`)}
                        onMouseOut={e => {
                          if (showIgnoreAlertForIndex !== index + 1) {
                            e.currentTarget.src = `${baseUrl}/Icone_ignorer_alerte.png`
                          }
                        }}
                      />
                    </FlexboxGrid.Item>
                  </FlexboxGrid>
                  : null
              }
            </List.Item>
          ))}
        </ScrollableContainer>
        {
          showIgnoreAlertForIndex
            ? <IgnoreAlertMenu
              id={ignoredAlertId}
              showIgnoreAlertForIndex={showIgnoreAlertForIndex}
              setShowIgnoreAlertForIndex={setShowIgnoreAlertForIndex}
              ignoreAlert={ignoreAlertCallback}
              baseRef={baseRef}
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

const AlertTransition = styled.div``
const alertIgnoredTransition = {
  background: '#E1000F33 0% 0% no-repeat padding-box',
  color: COLORS.maximumRed,
  fontWeight: 500,
  height: 41,
  marginTop: -13,
  textAlign: 'center',
  lineHeight: '41px'
}

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
  fontWeight: 500,
  fontSize: 16,
  color: COLORS.slateGray,
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
const validateAlertIconStyle = {
  paddingRight: 7,
  float: 'right',
  flexShrink: 0,
  cursor: 'pointer',
  marginLeft: 'auto',
  height: 16
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const ignoreAlertStyle = {
  paddingRight: 7,
  float: 'right',
  flexShrink: 0,
  cursor: 'pointer',
  marginLeft: 'auto',
  height: 16
}

const listItemStyle = (isFocused, toClose) => ({
  background: isFocused ? COLORS.gainsboro : COLORS.cultured,
  border: `1px solid ${COLORS.lightGray}`,
  borderRadius: 1,
  height: 15,
  marginTop: 6,
  transition: 'background 3s',
  animation: toClose ? 'close-alert-transition-item 2s ease forwards' : 'unset',
  overflow: 'hidden'
})

const styleCenter = {
  display: 'flex',
  alignItems: 'center',
  height: 15
}

const rowStyle = {
  width: 1300,
  fontWeight: 500,
  color: COLORS.gunMetal,
  boxShadow: 'unset'
}

const riskColumnStyle = {
  ...styleCenter,
  marginLeft: 10,
  width: 70
}

const vesselNameColumnStyle = {
  ...styleCenter,
  display: 'flex',
  width: 280
}

const cfrColumnStyle = {
  ...styleCenter,
  width: 180
}

const timeAgoColumnStyle = {
  ...styleCenter,
  width: 190
}

const alertTypeStyle = {
  ...styleCenter,
  marginLeft: 20,
  width: 410
}

const iconStyle = {
  ...styleCenter,
  marginLeft: 10,
  width: 30
}

const Content = styled.div``
const contentStyle = {
  padding: 40,
  background: COLORS.gainsboro
}

export default AlertsList
