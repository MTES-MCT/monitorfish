import countries from 'i18n-iso-countries'
import { MutableRefObject, useEffect, useRef } from 'react'
import { batch } from 'react-redux'
import { FlexboxGrid, List } from 'rsuite'
import styled from 'styled-components'
import * as timeago from 'timeago.js'

import { COLORS } from '../../../constants/constants'
import { getAlertNameFromType, getSilencedAlertPeriodText } from '../../../domain/entities/alerts'
import { ActiveAlert, AlertType, AlertValueForPending, SilencedAlert } from '../../../domain/types/alert'
import { validateAlert } from '../../../domain/use_cases/alert/validateAlert'
import getVesselVoyage from '../../../domain/use_cases/vessel/getVesselVoyage'
import showVessel from '../../../domain/use_cases/vessel/showVessel'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { Flag } from '../../vessel_list/tableCells'

import type { CSSProperties } from 'react'

// TODO Type these props.
export type PendingAlertRowProps = {
  alert: ActiveAlert | SilencedAlert
  index: number
  setShowSilencedAlertForIndex: any
  setSilencedAlertId: any
  showSilencedAlertForIndex: any
}
/**
 * This component use JSON styles and not styled-components ones so the new window can load the styles not in a lazy way
 */
export function PendingAlertRow({
  alert,
  index,
  setShowSilencedAlertForIndex,
  setSilencedAlertId,
  showSilencedAlertForIndex
}: PendingAlertRowProps) {
  const dispatch = useAppDispatch()
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const { focusOnAlert } = useAppSelector(state => state.alert)
  const baseUrl = window.location.origin

  useEffect(() => {
    if (focusOnAlert && alert.id === focusOnAlert.id) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [focusOnAlert, alert])

  return (
    <List.Item
      key={alert.id}
      ref={ref}
      index={index + 1}
      style={listItemStyle(
        focusOnAlert ? alert.id === focusOnAlert?.id : false,
        (alert.type === AlertType.SILENCED && alert.silencedPeriod) ||
          (alert.type === AlertType.ACTIVE && (alert as any).isValidated)
      )}
    >
      {alert.type === AlertType.ACTIVE && alert.isValidated && (
        <AlertTransition data-cy="side-window-alerts-is-validated-transition" style={alertValidatedTransition}>
          Alerte ajoutée à la fiche du navire
        </AlertTransition>
      )}
      {alert.type === AlertType.SILENCED && alert.silencedPeriod && (
        <AlertTransition data-cy="side-window-alerts-is-silenced-transition" style={alertSilencedTransition}>
          L&apos;alerte sera ignorée {getSilencedAlertPeriodText(alert.silencedPeriod)}
        </AlertTransition>
      )}
      {alert.type === AlertType.ACTIVE && !alert.isValidated && (
        <FlexboxGrid>
          <FlexboxGrid.Item style={timeAgoColumnStyle} title={alert.creationDate}>
            {timeago.format(new Date(alert.creationDate).getTime(), 'fr')}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={alertTypeStyle}>{getAlertNameFromType(alert.value.type)}</FlexboxGrid.Item>
          <FlexboxGrid.Item style={alertNatinfStyle}>
            {(alert.value as AlertValueForPending).natinfCode}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={vesselNameColumnStyle}>
            <Flag
              rel="preload"
              src={`${baseUrl ? `${baseUrl}/` : ''}flags/${(
                alert.value as AlertValueForPending
              ).flagState?.toLowerCase()}.svg`}
              style={{ marginLeft: 0, marginRight: 5, marginTop: 1, width: 18 }}
              title={countries.getName((alert.value as AlertValueForPending).flagState?.toLowerCase(), 'fr')}
            />
            {alert.vesselName}
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={rowBorderStyle} />
          <FlexboxGrid.Item style={iconStyle}>
            <Icon
              alt="Voir sur la carte"
              data-cy="side-window-alerts-show-vessel"
              onClick={() => {
                const vesselIdentity = { ...alert }
                dispatch(showVessel(vesselIdentity, false, false) as any)
                dispatch(getVesselVoyage(vesselIdentity, undefined, false) as any)
              }}
              src={`${baseUrl}/Icone_voir_sur_la_carte.png`}
              style={showIconStyle}
              title="Voir sur la carte"
            />
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={iconStyle}>
            <Icon
              alt="Valider"
              data-cy="side-window-alerts-validate-alert"
              onClick={() => dispatch(validateAlert(alert.id) as any)}
              onMouseOut={e => {
                e.currentTarget.src = `${baseUrl}/Icone_valider_alerte.png`
              }}
              onMouseOver={e => {
                e.currentTarget.src = `${baseUrl}/Icone_valider_alerte_pleine.png`
              }}
              src={`${baseUrl}/Icone_valider_alerte.png`}
              style={validateAlertIconStyle}
              title={"Valider l'alerte"}
            />
          </FlexboxGrid.Item>
          <FlexboxGrid.Item style={iconStyle}>
            <Icon
              alt="Ignorer"
              data-cy="side-window-alerts-silence-alert"
              onClick={() => {
                batch(() => {
                  setShowSilencedAlertForIndex(index + 1)
                  setSilencedAlertId(alert.id)
                })
              }}
              onMouseOut={e => {
                if (showSilencedAlertForIndex !== index + 1) {
                  e.currentTarget.src = `${baseUrl}/Icone_ignorer_alerte.png`
                }
              }}
              onMouseOver={e => {
                e.currentTarget.src = `${baseUrl}/Icone_ignorer_alerte_pleine.png`
              }}
              src={
                showSilencedAlertForIndex === index + 1
                  ? `${baseUrl}/Icone_ignorer_alerte_pleine.png`
                  : `${baseUrl}/Icone_ignorer_alerte.png`
              }
              style={silenceAlertStyle}
              title={"Ignorer l'alerte"}
            />
          </FlexboxGrid.Item>
        </FlexboxGrid>
      )}
    </List.Item>
  )
}

const AlertTransition = styled.div``
const alertSilencedTransition: CSSProperties = {
  background: '#E1000F33 0% 0% no-repeat padding-box',
  color: COLORS.maximumRed,
  fontWeight: 500,
  height: 41,
  lineHeight: '41px',
  marginTop: -13,
  textAlign: 'center'
}

const alertValidatedTransition: CSSProperties = {
  background: '#29B36133 0% 0% no-repeat padding-box',
  color: COLORS.mediumSeaGreen,
  fontWeight: 500,
  height: 41,
  lineHeight: '41px',
  marginTop: -13,
  textAlign: 'center'
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const showIconStyle: CSSProperties = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 16,
  marginLeft: 'auto',
  paddingRight: 5,
  width: 20
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const Icon = styled.img``
const validateAlertIconStyle: CSSProperties = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 16,
  marginLeft: 'auto',
  paddingRight: 5
}

// We need to use an IMG tag as with a SVG a DND drag event is emitted when the pointer
// goes back to the main window
const silenceAlertStyle: CSSProperties = {
  cursor: 'pointer',
  flexShrink: 0,
  float: 'right',
  height: 16,
  marginLeft: 'auto',
  paddingRight: 5
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
  borderLeft: `1px solid ${COLORS.lightGray}`,
  height: 43,
  marginRight: 5,
  marginTop: -14,
  width: 2
}
