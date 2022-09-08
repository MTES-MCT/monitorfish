import React, { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Flag } from '../../vessel_list/tableCells'
import { batch, useDispatch, useSelector } from 'react-redux'
import { FlexboxGrid, List } from 'rsuite'
import countries from 'i18n-iso-countries'
import * as timeago from 'timeago.js'
import { getAlertNameFromType, getSilencedAlertPeriodText } from '../../../domain/entities/alerts'
import showVessel from '../../../domain/use_cases/vessel/showVessel'
import getVesselVoyage from '../../../domain/use_cases/vessel/getVesselVoyage'
import validateAlert from '../../../domain/use_cases/alert/validateAlert'

/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 * @param alert
 * @param index
 * @param showSilencedAlertForIndex
 * @param setShowSilencedAlertForIndex
 * @param setSilencedAlertId
 * @param focusOnAlert
 * @return {JSX.Element}
 * @constructor
 */
const PendingAlertRow = ({ alert, index, showSilencedAlertForIndex, setShowSilencedAlertForIndex, setSilencedAlertId }) => {
  const dispatch = useDispatch()
  const ref = useRef()
  const {
    focusOnAlert
  } = useSelector(state => state.alert)
  const baseUrl = window.location.origin

  useEffect(() => {
    if (focusOnAlert && alert?.id === focusOnAlert?.id) {
      ref.current?.scrollIntoView({ block: 'start' })
    }
  }, [focusOnAlert, alert])

  return <List.Item
    ref={ref}
    key={alert.id}
    index={index + 1}
    style={listItemStyle(focusOnAlert
      ? alert.id === focusOnAlert?.id
      : false,
    alert.silencedPeriod || alert.isValidated)}
  >
    {
      alert.isValidated
        ? <AlertTransition
          data-cy={'side-window-alerts-is-validated-transition'}
          style={alertValidatedTransition}
        >
          Alerte ajoutée à la fiche du navire
        </AlertTransition>
        : null
    }
    {
      alert.silencedPeriod
        ? <AlertTransition
          data-cy={'side-window-alerts-is-silenced-transition'}
          style={alertSilencedTransition}
        >
          L&apos;alerte sera ignorée {getSilencedAlertPeriodText(alert.silencedPeriod)}
        </AlertTransition>
        : null
    }
    {
      !alert.isValidated && !alert.silencedPeriod
        ? <FlexboxGrid>
          <FlexboxGrid.Item style={timeAgoColumnStyle} title={alert.creationDate}>
            {timeago.format(new Date(alert.creationDate).getTime(), 'fr')}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={alertTypeStyle}>
            {getAlertNameFromType(alert.value.type)}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={alertNatinfStyle}>
            {alert.value.natinfCode}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={vesselNameColumnStyle}>
            <Flag
              title={countries.getName(alert.value.flagState?.toLowerCase(), 'fr')}
              rel="preload"
              src={`${baseUrl ? `${baseUrl}/` : ''}flags/${alert.value.flagState?.toLowerCase()}.svg`}
              style={{ width: 18, marginRight: 5, marginLeft: 0, marginTop: 1 }}
            />
            {alert.vesselName}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={rowBorderStyle}/>
          <FlexboxGrid.Item style={iconStyle}>
            <Icon
              data-cy={'side-window-alerts-show-vessel'}
              style={showIconStyle}
              alt={'Voir sur la carte'}
              title={'Voir sur la carte'}
              onClick={() => {
                const vesselIdentity = { ...alert }
                dispatch(showVessel(vesselIdentity, false, false, null))
                dispatch(getVesselVoyage(vesselIdentity, undefined, false))
              }}
              src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
            />
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={iconStyle}>
            <Icon
              data-cy={'side-window-alerts-validate-alert'}
              style={validateAlertIconStyle}
              alt={'Valider'}
              title={'Valider l\'alerte'}
              onClick={() => dispatch(validateAlert(alert.id))}
              src={`${baseUrl}/Icone_valider_alerte.png`}
              onMouseOver={e => (e.currentTarget.src = `${baseUrl}/Icone_valider_alerte_pleine.png`)}
              onMouseOut={e => (e.currentTarget.src = `${baseUrl}/Icone_valider_alerte.png`)}
            />
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={iconStyle}>
            <Icon
              data-cy={'side-window-alerts-silence-alert'}
              style={silenceAlertStyle}
              alt={'Ignorer'}
              title={'Ignorer l\'alerte'}
              onClick={() => {
                batch(() => {
                  setShowSilencedAlertForIndex(index + 1)
                  setSilencedAlertId(alert.id)
                })
              }}
              src={showSilencedAlertForIndex === index + 1
                ? `${baseUrl}/Icone_ignorer_alerte_pleine.png`
                : `${baseUrl}/Icone_ignorer_alerte.png`}
              onMouseOver={e => (e.currentTarget.src = `${baseUrl}/Icone_ignorer_alerte_pleine.png`)}
              onMouseOut={e => {
                if (showSilencedAlertForIndex !== index + 1) {
                  e.currentTarget.src = `${baseUrl}/Icone_ignorer_alerte.png`
                }
              }}
            />
          </FlexboxGrid.Item>
        </FlexboxGrid>
        : null
    }
  </List.Item>
}

const AlertTransition = styled.div``
const alertSilencedTransition = {
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

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const showIconStyle = {
  width: 20,
  paddingRight: 5,
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
  paddingRight: 5,
  float: 'right',
  flexShrink: 0,
  cursor: 'pointer',
  marginLeft: 'auto',
  height: 16
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const silenceAlertStyle = {
  paddingRight: 5,
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
  animation: toClose ? 'close-alert-transition-item 3s ease forwards' : 'unset',
  overflow: 'hidden'
})

const styleCenter = {
  display: 'flex',
  alignItems: 'center',
  height: 15
}

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

const iconStyle = {
  ...styleCenter,
  marginLeft: 5,
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

export default PendingAlertRow
