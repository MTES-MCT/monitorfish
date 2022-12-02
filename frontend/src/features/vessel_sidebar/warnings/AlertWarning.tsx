import { batch } from 'react-redux'
import styled from 'styled-components'

import { focusOnAlert } from '../../../domain/shared_slices/Alert'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { ReactComponent as AlertSVG } from '../../icons/Icone_alertes.svg'
import { getAlertNameFromType } from '../../side_window/alerts_reportings/utils'
import { SIDE_WINDOW_MENU } from '../../side_window/constants'

export function AlertWarning({ selectedVessel }) {
  const dispatch = useAppDispatch()

  return (
    <>
      {selectedVessel?.alerts?.length ? (
        <Alerts data-cy="vessel-sidebar-alert" onClick={() => showAlertInSideWindow(dispatch, selectedVessel)}>
          <AlertIcon />
          {selectedVessel?.alerts.length === 1
            ? getAlertNameFromType(selectedVessel?.alerts[0])
            : `${selectedVessel?.alerts.length} alertes`}
          <SeeAlert>
            {selectedVessel?.alerts.length === 1 ? "Voir l'alerte dans la liste" : 'Voir les alertes dans la liste'}
          </SeeAlert>
        </Alerts>
      ) : null}
    </>
  )
}

const showAlertInSideWindow = (dispatch, selectedVessel) => {
  batch(() => {
    dispatch(openSideWindowTab(SIDE_WINDOW_MENU.ALERTS.code))
    dispatch(
      focusOnAlert({
        externalReferenceNumber: selectedVessel.externalReferenceNumber,
        internalReferenceNumber: selectedVessel.internalReferenceNumber,
        ircs: selectedVessel.ircs,
        name: selectedVessel?.alerts[0]
      })
    )
  })
}

const SeeAlert = styled.span`
  font-size: 11px;
  float: right;
  margin-right: 10px;
  text-decoration: underline;
  text-transform: lowercase;
  line-height: 17px;
`

const AlertIcon = styled(AlertSVG)`
  width: 18px;
  height: 18px;
  margin-bottom: -4px;
  margin-right: 9px;
  margin-left: 7px;

  animation: ring 4s 0.7s ease-in-out;
  animation-iteration-count: 1;
  transform-origin: 50% 4px;

  @keyframes ring {
    0% {
      transform: rotate(0);
    }
    1% {
      transform: rotate(30deg);
    }
    3% {
      transform: rotate(-28deg);
    }
    5% {
      transform: rotate(34deg);
    }
    7% {
      transform: rotate(-32deg);
    }
    9% {
      transform: rotate(30deg);
    }
    11% {
      transform: rotate(-28deg);
    }
    13% {
      transform: rotate(26deg);
    }
    15% {
      transform: rotate(-24deg);
    }
    17% {
      transform: rotate(22deg);
    }
    19% {
      transform: rotate(-20deg);
    }
    21% {
      transform: rotate(18deg);
    }
    23% {
      transform: rotate(-16deg);
    }
    25% {
      transform: rotate(14deg);
    }
    27% {
      transform: rotate(-12deg);
    }
    29% {
      transform: rotate(10deg);
    }
    31% {
      transform: rotate(-8deg);
    }
    33% {
      transform: rotate(6deg);
    }
    35% {
      transform: rotate(-4deg);
    }
    37% {
      transform: rotate(2deg);
    }
    39% {
      transform: rotate(-1deg);
    }
    41% {
      transform: rotate(1deg);
    }
    43% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(0);
    }
  }
`

const Alerts = styled.div`
  cursor: pointer;
  background: #e1000f;
  font-weight: 500;
  font-size: 13px;
  color: #ffffff;
  text-transform: uppercase;
  width: 100%;
  text-align: left;
  padding: 5px 0;
  margin-top: 1px;
`
