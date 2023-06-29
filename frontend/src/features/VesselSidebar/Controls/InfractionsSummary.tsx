import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { NoValue } from '../common_styles/common.style'

type InfractionsSummaryProps = {
  numberOfControlsWithSomeGearsSeized: number
  numberOfControlsWithSomeSpeciesSeized: number
  numberOfDiversions: number
}
export function InfractionsSummary({
  numberOfControlsWithSomeGearsSeized,
  numberOfControlsWithSomeSpeciesSeized,
  numberOfDiversions
}: InfractionsSummaryProps) {
  const getText = value => (!Number.isNaN(value) ? value : <NoValue>-</NoValue>)

  return (
    <Wrapper>
      <Tag>
        <InfractionNumber isRed={!!numberOfControlsWithSomeGearsSeized}>
          {getText(numberOfControlsWithSomeGearsSeized)}
        </InfractionNumber>
        <Text>Appréhension engin</Text>
      </Tag>
      <Tag>
        <InfractionNumber isRed={!!numberOfControlsWithSomeSpeciesSeized}>
          {getText(numberOfControlsWithSomeSpeciesSeized)}
        </InfractionNumber>
        <Text>Appréhension espèce</Text>
      </Tag>
      <Tag>
        <InfractionNumber isRed={!!numberOfDiversions}>{getText(numberOfDiversions)}</InfractionNumber>
        <Text>Déroutement</Text>
      </Tag>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

const Text = styled.span`
  color: ${COLORS.charcoal};
  margin: 0 10px 0 4px;
  font-weight: 500;
`

const InfractionNumber = styled.span<{
  isRed: boolean
}>`
  background: ${props => (props.isRed ? COLORS.maximumRed : COLORS.charcoal)};
  color: ${COLORS.gainsboro};
  border-radius: 11px;
  height: 16px;
  display: inline-block;
  line-height: 14px;
  width: 16px;
  text-align: center;
  font-weight: bolder;
  margin: 3px 0 0 3px;
  font-weight: 500;
`

const Tag = styled.span`
  background: ${COLORS.gainsboro};
  border-radius: 11px;
  font-size: 13px;
  height: 22px;
  display: inline-block;
  margin: 8px 0px 10px 0;
`
