import { vesselsAreEquals } from '@features/Vessel/types/vessel'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { FingerprintLoader, THEME, usePrevious } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { EquipmentResume } from './resume/EquipmentResume'
import { useIsSuperUser } from '../../../../../../auth/hooks/useIsSuperUser'
import { setBeaconMalfunctionsTab } from '../../../../../../domain/shared_slices/BeaconMalfunction'
import { BeaconMalfunctionDetails } from '../../../../../BeaconMalfunction/components/BeaconMalfunctionDetails'
import { EquipmentTab } from '../../../../../BeaconMalfunction/constants'
import { getVesselBeaconMalfunctions } from '../../../../../BeaconMalfunction/useCases/getVesselBeaconMalfunctions'

export function VesselEquipment() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const {
    beaconMalfunctionsTab,
    loadingVesselBeaconMalfunctions,
    vesselBeaconMalfunctionsFromDate,
    vesselBeaconMalfunctionsResumeAndHistory
  } = useMainAppSelector(state => state.beaconMalfunction)
  const { selectedVessel, selectedVesselIdentity } = useMainAppSelector(state => state.vessel)
  const previousSelectedVesselIdentity = usePrevious(selectedVesselIdentity)
  const [isCurrentBeaconMalfunctionDetails, setIsCurrentBeaconMalfunctionDetails] = useState<boolean>(false)
  const hasNoBeacon = !selectedVessel?.vesselId

  useEffect(() => {
    dispatch(getVesselBeaconMalfunctions(true))
  }, [dispatch, selectedVesselIdentity])

  useEffect(() => {
    if (!vesselsAreEquals(previousSelectedVesselIdentity, selectedVesselIdentity)) {
      dispatch(setBeaconMalfunctionsTab(EquipmentTab.RESUME))
    }
  }, [dispatch, selectedVesselIdentity, vesselBeaconMalfunctionsFromDate, previousSelectedVesselIdentity])

  if (hasNoBeacon) {
    return (
      <NoBeacon data-cy="vessel-beacon-malfunctions">Nous n’avons trouvé aucune balise VMS pour ce navire.</NoBeacon>
    )
  }

  if (loadingVesselBeaconMalfunctions || !vesselBeaconMalfunctionsResumeAndHistory) {
    return <FingerprintLoader className="radar" color={THEME.color.charcoal} />
  }

  return (
    <Wrapper data-cy="vessel-beacon-malfunctions">
      {beaconMalfunctionsTab === EquipmentTab.RESUME && (
        <EquipmentResume setIsCurrentBeaconMalfunctionDetails={setIsCurrentBeaconMalfunctionDetails} />
      )}
      {isSuperUser && beaconMalfunctionsTab === EquipmentTab.BEACON_MALFUNCTION_DETAIL && (
        <BeaconMalfunctionDetails isCurrentBeaconMalfunctionDetails={isCurrentBeaconMalfunctionDetails} />
      )}
    </Wrapper>
  )
}

const NoBeacon = styled.div`
  border: ${p => p.theme.color.gainsboro} 10px solid;
  padding-top: 50px;
  height: 70px;
  background: ${p => p.theme.color.white};
  color: ${p => p.theme.color.slateGray};
  text-align: center;
`

const Wrapper = styled.div`
  margin: 10px;
  overflow: hidden;

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
    background: ${p => p.theme.color.slateGray} 0% 0% no-repeat padding-box;
    top: 1px;
  }
`
