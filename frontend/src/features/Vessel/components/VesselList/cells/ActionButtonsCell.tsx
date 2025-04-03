import { extractVesselIdentityProps } from '@features/Vessel/utils'
import { Vessel } from '@features/Vessel/Vessel.types'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { showVessel } from '../../../useCases/showVessel'

type ActionButtonsCellProps = Readonly<{
  vessel: Vessel.VesselLastPosition
}>
export function ActionButtonsCell({ vessel }: ActionButtonsCellProps) {
  const dispatch = useMainAppDispatch()

  const selectMainMapVessel = async () => {
    const vesselIdentity = extractVesselIdentityProps(vessel)

    dispatch(showVessel(vesselIdentity, false))
  }

  return (
    <Wrapper>
      <IconButton
        accent={Accent.TERTIARY}
        Icon={Icon.ViewOnMap}
        onClick={selectMainMapVessel}
        title="Centrer le navire sur la carte"
        withUnpropagatedClick
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  height: 20px;
  margin-bottom: 1px;

  > button {
    padding: 0;
  }
`
