import { useGetPortsQuery } from '@api/port'
import { ProfileBarChart } from '@features/Vessel/components/VesselSidebar/components/VesselProfile/ProfileBarChart'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export function VesselProfile() {
  const selectedVessel = useMainAppSelector(state => state.vessel.selectedVessel)
  const { data: ports } = useGetPortsQuery()

  const landingPorts = Object.keys(selectedVessel?.profile?.landingPorts ?? {}).reduce((acc, key) => {
    const port = ports?.find(p => p.locode === key)?.name

    acc[port ?? key] = (selectedVessel?.profile?.landingPorts ?? {})[key]

    return acc
  }, {})

  return (
    <Wrapper data-cy="vessel-profile">
      <Header>
        Profil du navire{' '}
        <StyledIcon size={16} title="Le profile de navire est calculé sur 1 an de déclarations de captures." />
      </Header>
      {!selectedVessel?.profile?.gears &&
        !selectedVessel?.profile?.species &&
        !selectedVessel?.profile?.faoAreas &&
        !selectedVessel?.profile?.landingPorts && <EmptyProfile>Aucun profil</EmptyProfile>}
      {selectedVessel?.profile?.gears && (
        <ProfileBarChart profile={selectedVessel?.profile?.gears} title="Engins habituels" />
      )}
      {selectedVessel?.profile?.species && (
        <ProfileBarChart profile={selectedVessel?.profile?.species} title="Espèces habituelles" />
      )}
      {selectedVessel?.profile?.faoAreas && (
        <ProfileBarChart profile={selectedVessel?.profile?.faoAreas} title="Zones de pêche habituelles" />
      )}
      {selectedVessel?.profile?.landingPorts && (
        <ProfileBarChart profile={landingPorts} title="Ports de débarque habituels" />
      )}
    </Wrapper>
  )
}

const StyledIcon = styled(Icon.Info)`
  margin-left: 4px;
`

const Wrapper = styled.div`
  margin-top: 10px;
  padding: 12px 24px 0 24px;
  background: ${p => p.theme.color.white};
  color: #FF3392;
  display: flex;
  flex-direction: column;
`

const Header = styled.span`
  font-size: 15px;
  margin-bottom: 16px;

  .Element-IconBox {
    vertical-align: sub;
  }
`

const EmptyProfile = styled.div`
  text-align: center;
  margin-bottom: 14px;
`
