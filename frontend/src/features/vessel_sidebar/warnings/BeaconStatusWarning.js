import { useDispatch } from 'react-redux'
import { openSideWindowTab } from '../../../domain/shared_slices/Global'
import { sideWindowMenu } from '../../../domain/entities/sideWindow'
import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as BeaconStatusSVG } from '../../icons/Icone_VMS_dark.svg'
import openBeaconStatus from '../../../domain/use_cases/openBeaconStatus'

const BeaconStatusWarning = ({ selectedVessel }) => {
  const dispatch = useDispatch()

  return (<>
    {
      selectedVessel?.beaconStatusId
        ? <BeaconStatus
          onClick={() => showBeaconStatusInSideWindow(dispatch, selectedVessel)}
          data-cy={'vessel-sidebar-beacon-status'}
        >
          <BeaconStatusIcon/>
          NON-ÉMISSION VMS
          <SeeBeaconStatus>
            Voir l&apos;avarie dans le tableau
          </SeeBeaconStatus>
        </BeaconStatus>
        : null
    }
    </>)
}

const showBeaconStatusInSideWindow = (dispatch, selectedVessel) => {
  dispatch(openSideWindowTab(sideWindowMenu.BEACON_STATUSES.code))
  dispatch(openBeaconStatus({
    beaconStatus: {
      id: selectedVessel?.beaconStatusId
    }
  }))
}

const SeeBeaconStatus = styled.span`
  font-size: 11px;
  float: right;
  margin-right: 10px;
  text-decoration: underline;
  text-transform: lowercase;
  line-height: 17px;
`

const BeaconStatusIcon = styled(BeaconStatusSVG)`
  width: 20px;
  height: 18px;
  margin-bottom: -4px;
  margin-right: 7px;
  margin-left: 8px;
  
  animation: ring 1s .7s ease-in-out;
  animation-iteration-count: 1;
  transform-origin: 50% 4px;
  
  @keyframes ring {
    0% { transform: scale(1); }
    25% { transform: scale(1.1); }
    50% { transform: scale(0.9); }
    75% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`

const BeaconStatus = styled.div`
  cursor: pointer;
  background: ${COLORS.yellow};
  color: ${COLORS.gunMetal};
  font-weight: 500;
  font-size: 13px;
  text-transform: uppercase;
  width: 100%;
  text-align: left;
  padding: 5px 0;
  margin-top: 1px;
`

export default BeaconStatusWarning
