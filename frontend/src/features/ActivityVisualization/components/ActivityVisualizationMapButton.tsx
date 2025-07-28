import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { ROUTER_PATHS } from '../../../paths'

export function ActivityVisualizationMapButton() {
  const isSuperUser = useIsSuperUser()

  return (
    import.meta.env.FRONTEND_KEPLER_ACTIVITY_VISUALIZATION_ENABLED === 'true' && (
      <Wrapper>
        <MapToolButton
          Icon={Icon.Chart}
          isActive={false}
          isLeftButton
          onClick={() => window.open(ROUTER_PATHS.activityVisualization, '_blank')}
          style={{ top: isSuperUser ? 342 : 185 }}
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
