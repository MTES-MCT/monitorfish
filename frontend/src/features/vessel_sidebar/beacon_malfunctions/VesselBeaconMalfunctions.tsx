import { useEffect, useState } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { BeaconMalfunctionsTab } from '../../../domain/entities/beaconMalfunction/constants'
import getVesselBeaconMalfunctions from '../../../domain/use_cases/beaconMalfunction/getVesselBeaconMalfunctions'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { BeaconMalfunctionDetails } from './details/BeaconMalfunctionDetails'
import BeaconMalfunctionsResumeAndHistory from './resume/BeaconMalfunctionsResumeAndHistory'

export function VesselBeaconMalfunctions() {
  const dispatch = useAppDispatch()
  const { beaconMalfunctionsTab, loadingVesselBeaconMalfunctions, vesselBeaconMalfunctionsFromDate } = useAppSelector(
    state => state.beaconMalfunction
  )
  const { selectedVessel } = useAppSelector(state => state.vessel)
  const [isCurrentBeaconMalfunctionDetails, setIsCurrentBeaconMalfunctionDetails] = useState<boolean>(false)

  useEffect(() => {
    dispatch(getVesselBeaconMalfunctions(true) as any)
  }, [dispatch, selectedVessel, vesselBeaconMalfunctionsFromDate])

  return (
    <>
      {!loadingVesselBeaconMalfunctions && beaconMalfunctionsTab ? (
        <Wrapper data-cy="vessel-beacon-malfunctions">
          {beaconMalfunctionsTab === BeaconMalfunctionsTab.RESUME && (
            <BeaconMalfunctionsResumeAndHistory
              setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails}
            />
          )}
          {beaconMalfunctionsTab === BeaconMalfunctionsTab.DETAIL && (
            <BeaconMalfunctionDetails isCurrentBeaconMalfunctionDetails={isCurrentBeaconMalfunctionDetails} />
          )}
        </Wrapper>
      ) : (
        <FingerprintSpinner className="radar" color={COLORS.charcoal} size={100} />
      )}
    </>
  )
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
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-active:hover,
  .rs-picker-select-menu-item:not(.rs-picker-select-menu-item-disabled):hover,
  .rs-picker-select-menu-item.rs-picker-select-menu-item-focus,
  .rs-picker-select-menu-item {
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
  .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-caret,
  .rs-picker-default .rs-picker-toggle.rs-btn .rs-picker-toggle-clean {
    top: 5px;
  }

  .rs-btn-toggle {
    background: #c8dce6 0% 0% no-repeat padding-box;
    border: 1px solid #707785;
    border-radius: 7px;
    margin: 3px 7px 0 7px;
  }
  .rs-btn-toggle::after {
    background: ${COLORS.slateGray} 0% 0% no-repeat padding-box;
    top: 1px;
  }
`
