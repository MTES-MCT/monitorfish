import { useGetNatinfsAsOptions } from '@features/Mission/components/MissionForm/hooks/useGetNatinfsAsOptions'
import { MissionAction } from '@features/Mission/missionAction.types'
import { find } from 'lodash-es'
import styled from 'styled-components'

type InfractionProps = {
  index: number
  infraction: MissionAction.Infraction
}
export function Infraction({ index, infraction }: InfractionProps) {
  const natinfsAsOptions = useGetNatinfsAsOptions()

  const infractionWithLabel = (function () {
    const infractionLabel = find(natinfsAsOptions, { value: infraction.natinf })?.label

    return { ...infraction, infractionLabel }
  })()

  return (
    <Wrapper isFirstInfraction={index === 1}>
      <InfractionTitle>Infraction {index}</InfractionTitle>
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

const InfractionTagText = styled.span`
  color: ${p => p.theme.color.gunMetal};
  margin: 0 7px 0 7px;
  font-weight: 500;
`

const InfractionTag = styled.span`
  margin: 5px 8px 0 0;
  background: ${p => p.theme.color.white};
  border-radius: 11px;
  font-size: 13px;
  height: 22px;
  display: inline-block;
  vertical-align: bottom;
`
