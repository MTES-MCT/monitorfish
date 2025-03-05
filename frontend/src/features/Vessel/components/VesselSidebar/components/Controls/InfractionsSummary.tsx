import { NoValue } from '@features/Vessel/components/VesselSidebar/components/common_styles/common.style'
import styled from 'styled-components'

type InfractionsSummaryProps = {
  numberOfControlsWithSomeGearsSeized: number | undefined
  numberOfControlsWithSomeSpeciesSeized: number | undefined
  numberOfDiversions: number | undefined
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
        <InfractionNumber $isRed={!!numberOfControlsWithSomeGearsSeized}>
          {getText(numberOfControlsWithSomeGearsSeized)}
        </InfractionNumber>
        <Text>Appréhens. engin</Text>
      </Tag>
      <Tag>
        <InfractionNumber $isRed={!!numberOfControlsWithSomeSpeciesSeized}>
          {getText(numberOfControlsWithSomeSpeciesSeized)}
        </InfractionNumber>
        <Text>Appréhens. espèce</Text>
      </Tag>
      <Tag>
        <InfractionNumber $isRed={!!numberOfDiversions}>{getText(numberOfDiversions)}</InfractionNumber>
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
  color: ${p => p.theme.color.charcoal};
  margin: 0 10px 0 4px;
  font-weight: 500;
`

const InfractionNumber = styled.span<{
  $isRed: boolean
}>`
  background: ${p => (p.$isRed ? p.theme.color.maximumRed : p.theme.color.charcoal)};
  color: ${p => p.theme.color.gainsboro};
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
  background: ${p => p.theme.color.gainsboro};
  border-radius: 11px;
  font-size: 13px;
  height: 22px;
  display: inline-block;
  margin: 8px 6px 10px 6px;
`
