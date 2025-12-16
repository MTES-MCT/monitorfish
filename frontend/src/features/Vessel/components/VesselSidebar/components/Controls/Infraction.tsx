import { MissionAction } from '@features/Mission/missionAction.types'
import { Tag, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { getInfractionTitle } from '../../../../../../domain/entities/controls'

type InfractionProps = {
  hasMultipleInfraction: boolean
  index: number
  infraction: MissionAction.Infraction
}
export function Infraction({ hasMultipleInfraction, index, infraction }: InfractionProps) {
  return (
    <Wrapper isFirstInfraction={index === 1}>
      <InfractionTitle>
        Infraction {hasMultipleInfraction && `${index} :`} {infraction.threatCharacterization}
      </InfractionTitle>
      {infraction.comments && (
        <>
          {infraction.comments}
          <br />
        </>
      )}
      <StyledTag backgroundColor={THEME.color.white}>
        {infraction.infractionType === MissionAction.InfractionType.WITH_RECORD ? 'Avec' : 'Sans'} PV
      </StyledTag>
      <StyledTag backgroundColor={THEME.color.white} title={getInfractionTitle(infraction)}>
        {infraction.threat} / NATINF {infraction.natinf}
      </StyledTag>
    </Wrapper>
  )
}

const InfractionTitle = styled.div`
  font-weight: bold;
`

const Wrapper = styled.div<{
  isFirstInfraction: boolean
}>`
  margin-top: ${p => (p.isFirstInfraction ? 5 : 16)}px;
  width: 390px;
  white-space: initial;
  padding-right: 24px;
  box-sizing: border-box;
`

const StyledTag = styled(Tag)`
  margin-top: 8px;
  margin-right: 8px;
  font-weight: 500;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 370px;
  display: inline-block;
  vertical-align: middle;
`
