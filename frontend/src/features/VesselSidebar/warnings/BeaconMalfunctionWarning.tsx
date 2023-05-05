import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { SideWindowMenuKey } from '../../../domain/entities/sideWindow/constants'
import { openBeaconMalfunctionInKanban } from '../../../domain/use_cases/beaconMalfunction/openBeaconMalfunctionInKanban'
import { sideWindowDispatchers } from '../../../domain/use_cases/sideWindow'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { ReactComponent as BeaconMalfunctionSVG } from '../../icons/Icone_VMS_dark.svg'

export function BeaconMalfunctionWarning({ selectedVessel }) {
  const dispatch = useMainAppDispatch()

  return (
    <>
      {selectedVessel?.beaconMalfunctionId ? (
        <BeaconMalfunction
          data-cy="vessel-sidebar-beacon-malfunction"
          onClick={() => showBeaconMalfunctionInSideWindow(dispatch, selectedVessel)}
        >
          <BeaconMalfunctionIcon />
          NON-ÉMISSION VMS
          <SeeBeaconMalfunction>Voir l&apos;avarie dans le tableau</SeeBeaconMalfunction>
        </BeaconMalfunction>
      ) : null}
    </>
  )
}

const showBeaconMalfunctionInSideWindow = (dispatch, selectedVessel) => {
  dispatch(sideWindowDispatchers.openMenuWithSubMenu(SideWindowMenuKey.BEACON_MALFUNCTION_LIST))
  dispatch(openBeaconMalfunctionInKanban(selectedVessel?.beaconMalfunctionId))
}

const SeeBeaconMalfunction = styled.span`
  font-size: 11px;
  float: right;
  margin-right: 10px;
  text-decoration: underline;
  text-transform: lowercase;
  line-height: 17px;
`

const BeaconMalfunctionIcon = styled(BeaconMalfunctionSVG)`
  width: 20px;
  height: 18px;
  margin-bottom: -4px;
  margin-right: 7px;
  margin-left: 8px;

  animation: ring 1s 0.7s ease-in-out;
  animation-iteration-count: 1;
  transform-origin: 50% 4px;

  @keyframes ring {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(1.1);
    }
    50% {
      transform: scale(0.9);
    }
    75% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
`

const BeaconMalfunction = styled.div`
  cursor: pointer;
  background: ${p => p.theme.color.goldenPoppy};
  color: ${THEME.color.gunMetal};
  font-weight: 500;
  font-size: 13px;
  text-transform: uppercase;
  width: 100%;
  text-align: left;
  padding: 5px 0;
  margin-top: 1px;
`
