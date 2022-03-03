import React, { useEffect } from 'react'
import styled from 'styled-components'

import { useDispatch, useSelector } from 'react-redux'
import { FingerprintSpinner } from 'react-epic-spinners'
import { BeaconMalfunctionsTab } from '../../../domain/entities/beaconStatus'
import { COLORS } from '../../../constants/constants'
import BeaconMalfunctionsResumeAndHistory from './resume/BeaconMalfunctionsResumeAndHistory'
import BeaconMalfunctionDetails from './details/BeaconMalfunctionDetails'
import getVesselBeaconMalfunctions from '../../../domain/use_cases/getVesselBeaconMalfunctions'

const VesselBeaconMalfunctions = () => {
  const dispatch = useDispatch()
  const {
    /** @type {number<BeaconMalfunctionsTab>} */
    beaconMalfunctionsTab,
    loadingVesselBeaconMalfunctions,
    vesselBeaconMalfunctionsFromDate
  } = useSelector(state => state.beaconStatus)

  useEffect(() => {
    if (vesselBeaconMalfunctionsFromDate) {
      dispatch(getVesselBeaconMalfunctions())
    }
  }, [])

  return <>
    { !loadingVesselBeaconMalfunctions && beaconMalfunctionsTab
      ? <Wrapper data-cy={'vessel-beacon-malfunctions'}>
        {
          beaconMalfunctionsTab === BeaconMalfunctionsTab.RESUME
            ? <BeaconMalfunctionsResumeAndHistory/>
            : null
        }
        {
          beaconMalfunctionsTab === BeaconMalfunctionsTab.DETAIL
            ? <BeaconMalfunctionDetails/>
            : null
        }
      </Wrapper>
      : <FingerprintSpinner color={COLORS.charcoal} className={'radar'} size={100}/>
    }
  </>
}

const Wrapper = styled.div`
  overflow-x: hidden;
  max-height: 700px;
`

export default VesselBeaconMalfunctions
