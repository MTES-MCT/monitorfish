import { MapBox } from '@features/Map/constants'
import { VesselGroupMenuDialog } from '@features/VesselGroup/components/VesselGroupMenuDialog'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { setRightMapBoxDisplayed } from '../../../domain/use_cases/setRightMapBoxDisplayed'
import { MapToolButton } from '../../MainWindow/components/MapButtons/shared/MapToolButton'

const MARGIN_TOP = 124

export function VesselGroupMapButton() {
  const dispatch = useMainAppDispatch()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const vesselGroupsIdsDisplayed = useMainAppSelector(state => state.vesselGroup.vesselGroupsIdsDisplayed)

  const toggleVesselGroupsMenu = () => {
    dispatch(setRightMapBoxDisplayed(rightMapBoxOpened === MapBox.VESSEL_GROUPS ? undefined : MapBox.VESSEL_GROUPS))
  }

  return (
    <Wrapper>
      <VesselGroupMenuDialog />
      <MapToolButton
        badgeBackgroundColor={THEME.color.gainsboro}
        badgeColor={THEME.color.gunMetal}
        badgeNumber={vesselGroupsIdsDisplayed?.length || undefined}
        Icon={Icon.VesselGroups}
        iconSize={25}
        isActive={rightMapBoxOpened === MapBox.VESSEL_GROUPS}
        onClick={toggleVesselGroupsMenu}
        style={{ color: THEME.color.gainsboro, top: MARGIN_TOP }}
        title="Groupes de navires"
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
`
