import { selectIsPositionReplayHeadbandDisplayed } from '@features/PositionReplay/selectors'
import { quitPositionReplay } from '@features/PositionReplay/useCases/quitPositionReplay'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Banner, Level, LinkButton } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type PositionReplayHeadbandProps = Readonly<{
  className?: string
}>
export function PositionReplayHeadband({ className }: PositionReplayHeadbandProps) {
  const dispatch = useMainAppDispatch()
  const isDisplayed = useMainAppSelector(selectIsPositionReplayHeadbandDisplayed)

  if (!isDisplayed) {
    return null
  }

  return (
    <Banner className={className} isCollapsible isFixed level={Level.WARNING} top="0">
      {/* `Banner` doesn't forward `data-cy` */}
      <span data-cy="position-replay-headband">
        Vous affichez les pistes des navires dans le passé.{' '}
        <InlineLinkButton onClick={() => dispatch(quitPositionReplay())}>
          Quitter le mode rejeu des positions
        </InlineLinkButton>
      </span>
    </Banner>
  )
}

/** `LinkButton` is a flex box: it would break the message line. */
const InlineLinkButton = styled(LinkButton)`
  && {
    display: inline-flex;
    font-size: inherit;
  }
`
