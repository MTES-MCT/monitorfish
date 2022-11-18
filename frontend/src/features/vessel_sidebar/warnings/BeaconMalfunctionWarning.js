import { useDispatch } from 'react-redux'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as BeaconMalfunctionSVG } from '../../icons/Icone_VMS_dark.svg'
import { openBeaconMalfunctionInKanban } from '../../../domain/use_cases/beaconMalfunction/openBeaconMalfunctionInKanban'
import { SideWindowMenuKey } from '../../side_window/constants'

const BeaconMalfunctionWarning = ({ selectedVessel }) => {
  const dispatch = useDispatch()

  return (
    <>
      {selectedVessel?.beaconMalfunctionId ? (
        <BeaconMalfunction
          onClick={() => showBeaconMalfunctionInSideWindow(dispatch, selectedVessel)}
          data-cy={'vessel-sidebar-beacon-malfunction'}
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
  dispatch(openSideWindowTab(SideWindowMenuKey.BEACON_MALFUNCTIONS))
  dispatch(
    openBeaconMalfunctionInKanban(selectedVessel?.beaconMalfunctionId)
  )
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
  color: ${COLORS.gunMetal};
  font-weight: 500;
  font-size: 13px;
  text-transform: uppercase;
  width: 100%;
  text-align: left;
  padding: 5px 0;
  margin-top: 1px;
`

export default BeaconMalfunctionWarning
