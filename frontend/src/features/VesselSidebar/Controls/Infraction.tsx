import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { MissionAction } from '../../../domain/types/missionAction'

type InfractionProps = {
  index: number
  infraction:
    | MissionAction.GearInfraction
    | MissionAction.SpeciesInfraction
    | MissionAction.LogbookInfraction
    | MissionAction.OtherInfraction
  infractionDomain: MissionAction.InfractionDomain
}
export function Infraction({ index, infraction, infractionDomain }: InfractionProps) {
  const infractionDomainText = useMemo(() => {
    switch (infractionDomain) {
      case MissionAction.InfractionDomain.GEAR:
        return 'engin'

      case MissionAction.InfractionDomain.SPECIES:
        return 'espèce'

      case MissionAction.InfractionDomain.LOGBOOK:
        return 'JPE'

      case MissionAction.InfractionDomain.OTHER:
        return 'autre'

      default:
        return ''
    }
  }, [infractionDomain])

  return (
    <Wrapper isFirstInfraction={index === 1}>
      <InfractionDomainText>
        {index}. Infraction {infractionDomainText}
      </InfractionDomainText>
      {infraction.comments && (
        <>
          {infraction.comments}
          <br />
        </>
      )}
      <InfractionTag>
        <InfractionTagText>
          {infraction.infractionType === MissionAction.InfractionType.WITH_RECORD ? 'Avec' : 'Sans'} PV
        </InfractionTagText>
      </InfractionTag>
      <InfractionTag>
        <InfractionTagText>NATINF {infraction.natinf}</InfractionTagText>
      </InfractionTag>
      {MissionAction.isGearInfraction(infraction) && infraction.gearSeized && (
        <InfractionTag>
          <RedCircle />
          <InfractionTagText>Appréhension engin</InfractionTagText>
        </InfractionTag>
      )}
      {MissionAction.isSpeciesInfraction(infraction) && infraction.speciesSeized && (
        <InfractionTag>
          <RedCircle />
          <InfractionTagText>Appréhension espèce</InfractionTagText>
        </InfractionTag>
      )}
    </Wrapper>
  )
}

const InfractionDomainText = styled.div`
  font-weight: bold;
`

const Wrapper = styled.div<{
  isFirstInfraction: boolean
}>`
  margin-top: ${p => (p.isFirstInfraction ? 5 : 16)}px;
  width: 390px;
  white-space: initial;
`

const InfractionTagText = styled.span`
  color: ${COLORS.gunMetal};
  margin: 0 8px 0 8px;
  font-weight: 500;
`

const RedCircle = styled.span`
  background: ${p => p.theme.color.maximumRed};
  color: ${p => p.theme.color.gainsboro};
  border-radius: 11px;
  height: 16px;
  width: 16px;
  display: inline-block;
  margin: 3px 0 0 4px;
`

const InfractionTag = styled.span`
  margin: 5px 8px 0px 0px;
  background: ${p => p.theme.color.white};
  border-radius: 11px;
  font-size: 13px;
  height: 22px;
  display: inline-block;
  vertical-align: bottom;
`
