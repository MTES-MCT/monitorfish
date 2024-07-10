import { CountryFlag } from '@components/CountryFlag'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { PriorNotification } from '../../PriorNotification.types'

type HeaderProps = Readonly<{
  onClose: () => void
  priorNotificationDetail: PriorNotification.PriorNotificationDetail
}>
export function Header({ onClose, priorNotificationDetail }: HeaderProps) {
  return (
    <Wrapper>
      <Title>
        <TitleRow>
          <TitleRowIconBox>
            <Icon.Fishery />
          </TitleRowIconBox>

          <span>{`Préavis navire ${priorNotificationDetail.isLessThanTwelveMetersVessel ? '< 12 M' : '≥ 12 M'}`}</span>
        </TitleRow>

        <TitleRow>
          <TitleRowIconBox>
            <CountryFlag countryCode={priorNotificationDetail.logbookMessage.flagState} size={[24, 18]} />
          </TitleRowIconBox>

          <span>
            <VesselName>{priorNotificationDetail.logbookMessage.vesselName}</VesselName> (
            {priorNotificationDetail.logbookMessage.internalReferenceNumber})
          </span>
        </TitleRow>
      </Title>

      <IconButton accent={Accent.TERTIARY} Icon={Icon.Close} isCompact onClick={onClose} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  align-items: flex-start;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  box-shadow: 0px 3px 6px ${p => p.theme.color.lightGray};
  display: flex;
  padding: 24px 32px;

  * {
    font-size: 16px;
  }
`

const Title = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  > div {
    &:nth-child(1) {
      color: ${p => p.theme.color.slateGray};
      font-weight: 700;
    }
    &:nth-child(2) {
      color: ${p => p.theme.color.gunMetal};
      margin-top: 8px;
    }
  }
`

const TitleRow = styled.div`
  align-items: flex-start;
  display: flex;
  line-height: 22px;
`

const TitleRowIconBox = styled.span`
  margin-right: 8px;
  width: 24px;

  > .Element-IconBox {
    vertical-align: -4px;
  }

  > img {
    vertical-align: -3.5px;
  }
`

const VesselName = styled.span`
  font-size: 16px;
  font-weight: 700;
`
