import { COLORS } from '@constants/constants'
import { useGetNatinfsAsOptions } from '@features/Mission/components/MissionForm/hooks/useGetNatinfsAsOptions'
import { find } from 'lodash-es'
import styled from 'styled-components'

import { MissionAction } from '../../../../../Mission/missionAction.types'

type InfractionProps = {
  index: number
  infraction: MissionAction.Infraction
  infractionDomain: MissionAction.InfractionDomain
}
export function Infraction({ index, infraction, infractionDomain }: InfractionProps) {
  const natinfsAsOptions = useGetNatinfsAsOptions()

  const infractionWithLabel = (function () {
    const infractionLabel = find(natinfsAsOptions, { value: infraction.natinf })?.label

    return { ...infraction, infractionLabel }
  })()

  const infractionDomainText = (function () {
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
  })()

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
        <InfractionTagText title={infractionWithLabel.infractionLabel}>
          NATINF {infractionWithLabel.natinf}
        </InfractionTagText>
      </InfractionTag>
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
  padding-right: 24px;
  box-sizing: border-box;
`

const InfractionTagText = styled.span`
  color: ${COLORS.gunMetal};
  margin: 0 7px 0 7px;
  font-weight: 500;
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
