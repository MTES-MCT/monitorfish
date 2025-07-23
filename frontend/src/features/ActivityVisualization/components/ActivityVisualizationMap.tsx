import { useGetActivityVisualizationQuery } from '@features/ActivityVisualization/apis'
import { trackEvent } from '@hooks/useTracking'
import { useIsSuperUser } from 'auth/hooks/useIsSuperUser'
import { useEffect } from 'react'

import { LoginBackground } from '../../../auth/components/Login'
import { LoadingSpinnerWall } from '../../../ui/LoadingSpinnerWall'

export function ActivityVisualizationMap() {
  const isSuperUser = useIsSuperUser()
  const { data: html } = useGetActivityVisualizationQuery()

  useEffect(() => {
    trackEvent({
      action: `Affichage des données d'activité (Kepler)`,
      category: 'VISIT',
      name: isSuperUser ? 'CNSP' : 'EXT'
    })
  }, [isSuperUser])

  useEffect(() => {
    if (!html) {
      return
    }

    setTimeout(() => {
      const map = (
        document.getElementById('kepler_iframe') as HTMLIFrameElement
      ).contentWindow?.document.getElementById('kepler-gl__map')
      if (map) {
        map.style.width = '100%'
        map.style.height = '100%'
      }
    }, 3000)
  }, [html])

  if (!html) {
    return (
      <LoginBackground>
        <LoadingSpinnerWall />
      </LoginBackground>
    )
  }

  return (
    <iframe
      height="100%"
      id="kepler_iframe"
      srcDoc={html}
      style={{ background: '#2c353c' }}
      title="MonitorFish - Visualization des données d'activité"
      width="100%"
    />
  )
}
