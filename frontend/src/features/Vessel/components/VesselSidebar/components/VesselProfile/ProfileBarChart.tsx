import { getSortedProfileBarsByDesc } from '@features/Vessel/components/VesselSidebar/components/VesselProfile/utils'
import styled from 'styled-components'

type ProfileBarChartProps = {
  profile: Record<string, number>
  title: string
}
export function ProfileBarChart({ profile, title }: ProfileBarChartProps) {
  const sortedProfileBarsByDesc = getSortedProfileBarsByDesc(profile)

  return (
    <Wrapper>
      <Header>{title}</Header>
      <Chart>
        {sortedProfileBarsByDesc.map(bar => (
          <Bar $backgroundColor={bar.color} $width={Number(bar.value)} title={`${bar.key} (${bar.value}%)`}>
            <span style={{ fontWeight: 500 }}>{bar.key}</span>
          </Bar>
        ))}
      </Chart>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  color: ${p => p.theme.color.slateGray};
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`

const Header = styled.span`
  font-size: 13px;
  margin-bottom: 8px;
`

const Chart = styled.div`
  display: flex;
  flex-direction: row;
`

const Bar = styled.div<{
  $backgroundColor: string
  $width: number
}>`
  padding: 2px 4px;
  color: ${p => p.theme.color.gunMetal};
  background: ${p => p.$backgroundColor};
  height: 20px;
  width: calc(${p => p.$width}% - 2px);
  margin-right: 2px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`
