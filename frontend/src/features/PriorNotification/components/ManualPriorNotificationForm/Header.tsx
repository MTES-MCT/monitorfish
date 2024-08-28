import { CountryFlag } from '@components/CountryFlag'
import { useGetVesselQuery } from '@features/Vessel/vesselApi'
import { Accent, Icon, IconButton } from '@mtes-mct/monitor-ui'
import { skipToken } from '@reduxjs/toolkit/query'
import styled, { keyframes } from 'styled-components'

type HeaderProps = Readonly<{
  isNewPriorNotification: boolean
  onClose: () => void
  vesselId: number | undefined
}>
export function Header({ isNewPriorNotification, onClose, vesselId }: HeaderProps) {
  const { data: vessel } = useGetVesselQuery(vesselId ?? skipToken)

  return (
    <Wrapper>
      <Title>
        <TitleRow>
          <TitleRowIconBox>
            <Icon.Fishery />
          </TitleRowIconBox>

          {/* TODO "< 12 M" doesn't make sense anymore. */}
          {isNewPriorNotification && <span>{`AJOUTER UN NOUVEAU PRÉAVIS (< 12 M)`}</span>}
          {!isNewPriorNotification && <span>{`PRÉAVIS NAVIRE < 12 M`}</span>}
        </TitleRow>

        {!isNewPriorNotification && (
          <TitleRow>
            <TitleRowIconBox>
              {vessel ? (
                <CountryFlag countryCode={vessel.flagState} size={[24, 18]} />
              ) : (
                <Loader $height={18} $width={24} />
              )}
            </TitleRowIconBox>

            {vessel ? (
              <span>
                <VesselName>{vessel.vesselName ?? '...'}</VesselName> ({vessel.internalReferenceNumber ?? '...'})
              </span>
            ) : (
              <Loader $height={22} />
            )}
          </TitleRow>
        )}
      </Title>

      <IconButton accent={Accent.TERTIARY} Icon={Icon.Close} isCompact onClick={onClose} title="Fermer le formulaire" />
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
