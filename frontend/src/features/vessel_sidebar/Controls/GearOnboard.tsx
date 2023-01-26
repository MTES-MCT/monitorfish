import styled from 'styled-components'

import type { GearControl } from '../../../domain/types/missionAction'

type GearOnboardProps = {
  gearOnboard: GearControl
}
export function GearOnboard({ gearOnboard }: GearOnboardProps) {
  return (
    <Wrapper>
      <Title>
        Engin {gearOnboard.gearWasControlled || 'non '}contrôlé - {gearOnboard.gearName} ({gearOnboard.gearCode})
      </Title>
      Maillage {gearOnboard.declaredMesh ? `déclaré ${gearOnboard.declaredMesh} mm, ` : ''}
      {gearOnboard.controlledMesh ? `mesuré ${gearOnboard.controlledMesh} mm` : 'non mesuré'}
      <br />
      {gearOnboard.comments}
    </Wrapper>
  )
}

const Title = styled.div`
  font-weight: bold;
`

const Wrapper = styled.div`
  margin-top: 16px;
`
