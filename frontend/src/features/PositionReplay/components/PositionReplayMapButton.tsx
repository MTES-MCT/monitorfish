import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { selectIsPositionReplayActive } from '@features/PositionReplay/selectors'
import { startPositionReplay } from '@features/PositionReplay/useCases/startPositionReplay'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { Icon } from '@mtes-mct/monitor-ui'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'

/** The replay is quit from its banner only. */
export function PositionReplayMapButton() {
  const dispatch = useMainAppDispatch()
  const isActive = useMainAppSelector(selectIsPositionReplayActive)
  const isSuperUser = useIsSuperUser()

  const start = () => {
    if (isActive) {
      return
    }

    dispatch(startPositionReplay())
    trackEvent({
      action: 'Lancement du rejeu des positions',
      category: 'POSITION_REPLAY',
      name: isSuperUser ? 'CNSP' : 'EXT'
    })
  }

  return (
    <MapToolButton
      data-cy="position-replay-map-button"
      Icon={Icon.Clock}
      isActive={isActive}
      onClick={start}
      title="Rejouer les positions à une date passée"
    />
  )
}
