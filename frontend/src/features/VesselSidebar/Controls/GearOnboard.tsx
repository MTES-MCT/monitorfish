import styled from 'styled-components'

import type { MissionAction } from '../../../domain/types/missionAction'

type GearOnboardProps = {
  gearOnboard: MissionAction.GearControl
}
export function GearOnboard({ gearOnboard }: GearOnboardProps) {
  return (
    <Wrapper>
      <Title>
        {gearOnboard.gearName} ({gearOnboard.gearCode}) – {gearOnboard.gearWasControlled || 'non '}contrôlé
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
  white-space: normal;
  width: 100%;
`

const Wrapper = styled.div`
  margin-top: 16px;
  white-space: initial;
  padding-right: 24px;
  box-sizing: border-box;
`
