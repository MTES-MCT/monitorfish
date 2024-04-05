import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import countries from 'i18n-iso-countries'
import styled from 'styled-components'

import type { PriorNotification } from '@features/PriorNotification/PriorNotification.types'

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

          <span>
            PNO {priorNotificationDetail.isLessThanTwelveMetersVessel ? '< 12 M' : '≥ 12 M'} -{' '}
            {priorNotificationDetail.logbookMessage.tripSegments
              ?.map(tripSegment => tripSegment.name.toUpperCase())
              .join(', ') ?? 'SEGMENT(S) INCONNU(S)'}
          </span>
        </TitleRow>

        <TitleRow>
          <TitleRowIconBox>
            <img
              alt={priorNotificationDetail.logbookMessage.flagState}
              src={`/flags/${countries
                .alpha3ToAlpha2(priorNotificationDetail.logbookMessage.flagState)
                .toLowerCase()}.png`}
              title={priorNotificationDetail.logbookMessage.flagState}
            />
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
    vertical-align: -2px;
  }
`

const VesselName = styled.span`
  font-size: 16px;
  font-weight: 700;
`
