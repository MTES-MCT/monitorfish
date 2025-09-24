import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ROUTER_PATHS } from '../../../paths'

export function ActivityVisualizationMapButton() {
  return (
    import.meta.env.FRONTEND_KEPLER_ACTIVITY_VISUALIZATION_ENABLED === 'true' && (
      <Wrapper>
        <MapToolButton
          Icon={Icon.Chart}
          isActive={false}
          isShrinkable={false}
          onClick={() => window.open(ROUTER_PATHS.activityVisualization, '_blank')}
          title="Données d'activité"
        />
      </Wrapper>
    )
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;

  * {
    box-sizing: border-box;
  }
`
