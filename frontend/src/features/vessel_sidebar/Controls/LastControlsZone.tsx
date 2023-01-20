import { LastControl } from './LastControl'
import { MissionActionType } from '../../../domain/types/missionAction'
import { NoValue, Title, Zone } from '../common_styles/common.style'

import type { LastControls } from '../../../domain/types/missionAction'

type LastControlZoneProps = {
  controlsFromDate: Date
  lastControls: LastControls
}
export function LastControlsZone({ controlsFromDate, lastControls }: LastControlZoneProps) {
  return (
    lastControls && (
      <Zone>
        <Title>
          Derniers contrôles depuis{' '}
          {controlsFromDate ? (
            <>
              {controlsFromDate.getUTCFullYear() + 1} (sur{' '}
              {new Date().getFullYear() - controlsFromDate.getUTCFullYear() - 1} ans)
            </>
          ) : (
            <NoValue>-</NoValue>
          )}
        </Title>
        <LastControl field={lastControls.SEA} isFirst type={MissionActionType.SEA_CONTROL} />
        <LastControl
          data-cy="vessel-controls-last-land-control"
          field={lastControls.LAND}
          isFirst={false}
          type={MissionActionType.LAND_CONTROL}
        />
      </Zone>
    )
  )
}
