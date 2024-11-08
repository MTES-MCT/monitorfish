import { CountryFlag } from '@components/CountryFlag'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import styled, { keyframes } from 'styled-components'

import type { Vessel } from '@features/Vessel/Vessel.types'
import type { ReactNode } from 'react'

type CardHeaderProps = Readonly<{
  children?: ReactNode
  isLessThanTwelveMetersVessel?: boolean | undefined
  isNewPriorNotification?: boolean
  onClose: () => void
  selectedVesselIdentity: Vessel.VesselIdentity | undefined
  withCloseButton?: boolean
  withFirstTitleRow?: boolean
}>
export function CardHeader({
  children,
  isLessThanTwelveMetersVessel,
  isNewPriorNotification = false,
  onClose,
  selectedVesselIdentity,
  withCloseButton = false,
  withFirstTitleRow = false
}: CardHeaderProps) {
  return (
    <Wrapper>
      <Title>
        {withFirstTitleRow && (
          <TitleRow>
            <TitleRowIconBox>
              <Icon.Fishery />
            </TitleRowIconBox>

            {isNewPriorNotification && <span>AJOUTER UN NOUVEAU PRÉAVIS</span>}
            {!isNewPriorNotification && (
              <span>
                PRÉAVIS NAVIRE
                {isLessThanTwelveMetersVessel !== undefined && (
                  <>{isLessThanTwelveMetersVessel ? ' < 12 M' : ' ≥ 12 M'}</>
                )}
              </span>
            )}
          </TitleRow>
        )}

        {!isNewPriorNotification && (
          <TitleRow>
            <TitleRowIconBox>
              {selectedVesselIdentity ? (
                <CountryFlag countryCode={selectedVesselIdentity.flagState} size={[24, 18]} />
              ) : (
                <Loader $height={18} $width={24} />
              )}
            </TitleRowIconBox>

            {selectedVesselIdentity ? (
              <span>
                <VesselName>{selectedVesselIdentity.vesselName ?? '...'}</VesselName> (
                {selectedVesselIdentity.internalReferenceNumber ?? '...'})
              </span>
            ) : (
              <Loader $height={22} />
            )}
          </TitleRow>
        )}

        {children}
      </Title>

      {withCloseButton && (
        <IconButton
          accent={Accent.TERTIARY}
          Icon={Icon.Close}
          isCompact
          onClick={onClose}
          title="Fermer le formulaire"
        />
      )}
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

  > img,
  > span {
    vertical-align: -3.5px;
  }
`

const loaderAnimation = keyframes`
  from {
    left: -100%;
  }

  to {
    left: 100%;
  }
`
const Loader = styled.span<{
  $height?: number
  $width?: number
}>`
  background-color: ${p => p.theme.color.lightGray};
  display: inline-block;
  height: ${p => (p.$height ? `${p.$height}px` : '100%')};
  overflow: hidden;
  position: relative;
  width: ${p => (p.$width ? `${p.$width}px` : '100%')};

  &:before {
    animation: ${loaderAnimation} 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    background: linear-gradient(to right, transparent 0%, ${p => p.theme.color.white} 50%, transparent 100%);
    content: '';
    display: block;
    height: 100%;
    left: -100%;
    position: absolute;
    top: 0;
    width: 100%;
  }
`

const VesselName = styled.span`
  font-size: 16px;
  font-weight: 700;
`
