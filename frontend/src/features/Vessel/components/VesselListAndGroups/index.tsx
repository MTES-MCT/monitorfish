import { Header } from '@features/SideWindow/components/Header'
import { Page } from '@features/SideWindow/components/Page'
import { SideWindowMenuKey, SideWindowMenuLabel } from '@features/SideWindow/constants'
import { openSideWindowPath } from '@features/SideWindow/useCases/openSideWindowPath'
import { VesselList } from '@features/Vessel/components/VesselList'
import { VesselGroupList } from '@features/VesselGroup/components/VesselGroupList'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type VesselListAndGroupsProps = Readonly<{
  isFromUrl: boolean
}>
export function VesselListAndGroups({ isFromUrl }: VesselListAndGroupsProps) {
  const dispatch = useMainAppDispatch()
  const selectedPath = useMainAppSelector(state => state.sideWindow.selectedPath)

  return (
    <Page>
      <StyledHeader>
        <StyledTitle
          $isSelected={selectedPath.menu === SideWindowMenuKey.VESSEL_LIST}
          onClick={() => dispatch(openSideWindowPath({ menu: SideWindowMenuKey.VESSEL_LIST }))}
          title={SideWindowMenuLabel[SideWindowMenuKey.VESSEL_LIST]}
        >
          <Icon.VesselList size={26} /> {SideWindowMenuLabel[SideWindowMenuKey.VESSEL_LIST]}
        </StyledTitle>
        <StyledTitle
          $isSelected={selectedPath.menu === SideWindowMenuKey.VESSEL_GROUP}
          onClick={() => dispatch(openSideWindowPath({ menu: SideWindowMenuKey.VESSEL_GROUP }))}
          title={SideWindowMenuLabel[SideWindowMenuKey.VESSEL_GROUP]}
        >
          <Icon.VesselGroups size={26} /> {SideWindowMenuLabel[SideWindowMenuKey.VESSEL_GROUP]}
        </StyledTitle>
      </StyledHeader>

      {selectedPath.menu === SideWindowMenuKey.VESSEL_LIST && <VesselList isFromUrl={isFromUrl} />}
      {selectedPath.menu === SideWindowMenuKey.VESSEL_GROUP && <VesselGroupList isFromUrl={isFromUrl} />}
    </Page>
  )
}

const StyledTitle = styled(Header.Title)<{
  $isSelected: boolean
}>`
  cursor: pointer;
  ${p => {
    if (p.$isSelected) {
      return `
      border-bottom: 5px solid ${p.theme.color.blueGray};
      padding-bottom: 8px;
      `
    }

    return 'padding-bottom: 12px;'
  }}

  span:first-of-type {
    vertical-align: sub;
  }
`

const StyledHeader = styled(Header)`
  justify-content: normal;

  :nth-child(2) {
    margin-left: 48px;
  }
`
