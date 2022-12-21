import { batch } from 'react-redux'
import styled from 'styled-components'

import { focusOnAlert } from '../../../domain/shared_slices/Alert'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { ReactComponent as AlertSVG } from '../../icons/Icone_alertes.svg'
import { getAlertNameFromType } from '../../SideWindow/alerts_reportings/utils'
import { SideWindowMenuKey } from '../../SideWindow/constants'

export function AlertWarning({ selectedVessel }) {
  const dispatch = useAppDispatch()

  return (
    <>
      {!!selectedVessel?.alerts?.length && (
        <Alerts data-cy="vessel-sidebar-alert" onClick={() => showAlertInSideWindow(dispatch, selectedVessel)}>
          <AlertIcon />
          {selectedVessel?.alerts.length === 1
            ? getAlertNameFromType(selectedVessel?.alerts[0])
            : `${selectedVessel?.alerts.length} alertes`}
          <SeeAlert>
            {selectedVessel?.alerts.length === 1 ? "Voir l'alerte dans la liste" : 'Voir les alertes dans la liste'}
          </SeeAlert>
        </Alerts>
      )}
    </>
  )
}

const showAlertInSideWindow = (dispatch, selectedVessel) => {
  batch(() => {
    dispatch(openSideWindowTab(SideWindowMenuKey.ALERTS))
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
  float: right;
  font-size: 11px;
  line-height: 17px;
  margin-right: 10px;
  text-decoration: underline;
  text-transform: lowercase;
`

const AlertIcon = styled(AlertSVG)`
  animation: ring 4s 0.7s ease-in-out;
  animation-iteration-count: 1;
  height: 18px;
  margin-bottom: -4px;
  margin-left: 7px;
  margin-right: 9px;
  transform-origin: 50% 4px;
  width: 18px;

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
  background: #e1000f;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  margin-top: 1px;
  padding: 5px 0;
  text-align: left;
  text-transform: uppercase;
  width: 100%;
`
