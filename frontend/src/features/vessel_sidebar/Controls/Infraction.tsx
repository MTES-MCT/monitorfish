import { useMemo } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import {
  InfractionDomain,
  InfractionType,
  isGearInfraction,
  isSpeciesInfraction
} from '../../../domain/types/missionAction'

import type {
  GearInfraction,
  LogbookInfraction,
  OtherInfraction,
  SpeciesInfraction
} from '../../../domain/types/missionAction'

type InfractionProps = {
  index: number
  infraction: GearInfraction | SpeciesInfraction | LogbookInfraction | OtherInfraction
  infractionDomain: InfractionDomain
}
export function Infraction({ index, infraction, infractionDomain }: InfractionProps) {
  const infractionDomainText = useMemo(() => {
    switch (infractionDomain) {
      case InfractionDomain.GEAR:
        return 'engin'
      case InfractionDomain.SPECIES:
        return 'espèce'
      case InfractionDomain.LOGBOOK:
        return 'JPE'
      case InfractionDomain.OTHER:
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
      {infraction.comments}
      <br />
      <InfractionTag>
        <InfractionTagText>
          {infraction.infractionType === InfractionType.WITH_RECORD ? 'Avec' : 'Sans'} PV
        </InfractionTagText>
      </InfractionTag>
      <InfractionTag>
        <InfractionTagText>NATINF {infraction.natinf}</InfractionTagText>
      </InfractionTag>
      {isGearInfraction(infraction) && infraction.gearSeized && (
        <InfractionTag>
          <RedCircle />
          <InfractionTagText>Appréhension engin</InfractionTagText>
        </InfractionTag>
      )}
      {isSpeciesInfraction(infraction) && infraction.speciesSeized && (
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
`

const InfractionTagText = styled.span`
  color: ${COLORS.gunMetal};
  margin: 0 5px 0 5px;
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
