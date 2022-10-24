import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useDispatch, useSelector } from 'react-redux'
import { FingerprintSpinner } from 'react-epic-spinners'
import { BeaconMalfunctionsTab } from '../../../domain/entities/beaconMalfunction/constants'
import { COLORS } from '../../../constants/constants'
import BeaconMalfunctionsResumeAndHistory from './resume/BeaconMalfunctionsResumeAndHistory'
import BeaconMalfunctionDetails from './details/BeaconMalfunctionDetails'
import getVesselBeaconMalfunctions from '../../../domain/use_cases/beaconMalfunction/getVesselBeaconMalfunctions'

const VesselBeaconMalfunctions = () => {
  const dispatch = useDispatch()
  const {
    /** @type {number<BeaconMalfunctionsTab>} */
    beaconMalfunctionsTab,
    loadingVesselBeaconMalfunctions,
    vesselBeaconMalfunctionsFromDate
  } = useSelector(state => state.beaconMalfunction)
  const {
    selectedVessel
  } = useSelector(state => state.vessel)
  const [isCurrentBeaconMalfunctionDetails, setIsCurrentBeaconMalfunctionDetails] = useState(null)

  useEffect(() => {
    dispatch(getVesselBeaconMalfunctions())
  }, [selectedVessel, vesselBeaconMalfunctionsFromDate])

  return <>
    { !loadingVesselBeaconMalfunctions && beaconMalfunctionsTab
      ? <Wrapper data-cy={'vessel-beacon-malfunctions'}>
        {
          beaconMalfunctionsTab === BeaconMalfunctionsTab.RESUME
            ? <BeaconMalfunctionsResumeAndHistory setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}/>
            : null
        }
        {
          beaconMalfunctionsTab === BeaconMalfunctionsTab.DETAIL
            ? <BeaconMalfunctionDetails isCurrentBeaconMalfunctionDetails={isCurrentBeaconMalfunctionDetails}/>
            : null
        }
      </Wrapper>
      : <FingerprintSpinner color={COLORS.charcoal} className={'radar'} size={100}/>
    }
  </>
}

const Wrapper = styled.div`
  overflow: hidden;
  max-height: 700px;

  .rs-btn rs-btn-default rs-picker-toggle {
    background: #1675e0 !important;
  }
  .rs-picker-toggle-wrapper {
    display: block;
  }
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active, .rs-picker-select-menu-item.rs-picker-select-menu-item-active:hover,
  .rs-picker-select-menu-item:not(.rs-picker-select-menu-item-disabled):hover, .rs-picker-select-menu-item.rs-picker-select-menu-item-focus, .rs-picker-select-menu-item {
    color: #707785;
    font-size: 13px;
    font-weight: normal;
  }
  .rs-picker-select-menu-items {
    overflow-y: unset;
  }
  .rs-picker-select {
    width: 155px !important;
    margin: 8px 10px 0 10px !important;
    background: ${props => props.background};
    height: 30px;
  }
  .rs-picker-toggle-wrapper .rs-picker-toggle.rs-btn {
    padding-right: 27px;
    padding-left: 10px;
    height: 15px;
    padding-top: 5px;
    padding-bottom: 8px;
  }
  .rs-picker-toggle.rs-btn {
    padding-left: 5px !important;
  }
  .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret, .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
    top: 5px;
  }

  .rs-btn-toggle {
    background: #C8DCE6 0% 0% no-repeat padding-box;
    border: 1px solid #707785;
    border-radius: 7px;
    margin: 3px 7px 0 7px;
  }
  .rs-btn-toggle::after {
    background: ${COLORS.slateGray} 0% 0% no-repeat padding-box;
    top: 1px;
  }
`

export default VesselBeaconMalfunctions
