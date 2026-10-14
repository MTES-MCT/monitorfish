import { useGetInfractionsQuery } from '@features/Infraction/apis'
import { INQUIRY_CONTROL_TYPE_LABEL, INQUIRY_INFRACTION_TYPE_LABEL } from '@features/Inquiry/constants'
import { Tag, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { Inquiry } from '@features/Inquiry/Inquiry.types'

type InquiryInfractionProps = Readonly<{
  hasMultipleInfraction: boolean
  index: number
  infraction: Inquiry.InquiryInfraction
}>
export function InquiryInfraction({ hasMultipleInfraction, index, infraction }: InquiryInfractionProps) {
  const { data: natinfs } = useGetInfractionsQuery()

  const controlTypeLabel = infraction.controlType ? INQUIRY_CONTROL_TYPE_LABEL[infraction.controlType] : undefined
  const title = `Infraction ${hasMultipleInfraction ? `${index} : ` : ''}${controlTypeLabel ?? ''}`

  const getNatinfLabel = (natinf: string) =>
    natinfs?.find(natinfRef => String(natinfRef.natinfCode) === natinf)?.infraction

  return (
    <Wrapper>
      <InfractionTitle title={title}>{title}</InfractionTitle>
      {infraction.observations && <Observations>{infraction.observations}</Observations>}
      {infraction.infractionType && (
        <StyledTag backgroundColor={THEME.color.white}>
          {INQUIRY_INFRACTION_TYPE_LABEL[infraction.infractionType]}
        </StyledTag>
      )}
      {infraction.natinfs.map(natinf => (
        <StyledTag key={natinf} backgroundColor={THEME.color.white} title={getNatinfLabel(natinf)}>
          NATINF {natinf}
        </StyledTag>
      ))}
    </Wrapper>
  )
}

const InfractionTitle = styled.div`
  font-weight: bold;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const Observations = styled.div`
  white-space: pre-wrap;
`

const Wrapper = styled.div`
  margin-top: 16px;
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
