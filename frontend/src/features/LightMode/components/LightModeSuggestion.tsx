import { useIsInLightMode } from '@hooks/useIsInLightMode'
import { useTracking } from '@hooks/useTracking'
import { Accent, Banner, Button, Level } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { LightModePreference } from '../constants'
import {
  getLightModePreference,
  isConnectionSlow,
  type NetworkInformation,
  setLightModePreference,
  switchLightMode
} from '../utils'

const ACTIVE_VESSELS_PATH = '/bff/v1/vessels'

const getConnection = () => (navigator as Navigator & { connection?: NetworkInformation }).connection

/**
 * Suggests the light mode once, when the connection is slow (e.g. a satellite link on a patrol vessel).
 */
export function LightModeSuggestion() {
  const isInLightMode = useIsInLightMode()
  const isSuperUser = useIsSuperUser()
  const { trackEvent } = useTracking()
  const [isSuggestable] = useState(() => !isInLightMode && getLightModePreference() === undefined)
  const [isDisplayed, setIsDisplayed] = useState(
    () => isSuggestable && isConnectionSlow({ connection: getConnection(), vesselsFetchDurationMs: undefined })
  )

  useEffect(() => {
    if (!isSuggestable || isDisplayed) {
      return undefined
    }

    const connection = getConnection()
    // Measures the download of the first active vessels, the heaviest request of the startup
    const observer = new PerformanceObserver(list => {
      const vesselsEntry = list
        .getEntries()
        .find(entry => new URL(entry.name, window.location.origin).pathname === ACTIVE_VESSELS_PATH)
      if (!vesselsEntry) {
        return
      }

      observer.disconnect()
      if (isConnectionSlow({ connection, vesselsFetchDurationMs: vesselsEntry.duration })) {
        setIsDisplayed(true)
      }
    })
    observer.observe({ buffered: true, type: 'resource' })

    return () => observer.disconnect()
    // Only measured once: on the first vessels download
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuggestable])

  if (!isDisplayed) {
    return null
  }

  const track = (action: string) => trackEvent({ action, category: 'LIGHT_MODE', name: isSuperUser ? 'CNSP' : 'EXT' })

  const accept = () => {
    track('Activation du mode connexion lente suggéré')
    switchLightMode(true)
  }

  const decline = () => {
    track('Refus du mode connexion lente suggéré')
    setLightModePreference(LightModePreference.DECLINED)
    setIsDisplayed(false)
  }

  return (
    <StyledBanner
      closingDelay={0}
      isClosable
      isCollapsible={false}
      isFixed
      isHiddenByDefault={false}
      level={Level.INFO}
      onClose={() => setIsDisplayed(false)}
      top="0"
      withAutomaticClosing={false}
    >
      <Content data-cy="light-mode-suggestion">
        Connexion lente détectée : le mode connexion lente allège l’application (fonds de carte en cache, mises à jour
        moins fréquentes).
        <Button accent={Accent.PRIMARY} onClick={accept}>
          Activer
        </Button>
        <Button accent={Accent.TERTIARY} onClick={decline}>
          Non merci
        </Button>
      </Content>
    </StyledBanner>
  )
}

const StyledBanner = styled(Banner)`
  z-index: 9999;
`

const Content = styled.div`
  align-items: center;
  display: flex;
  gap: 16px;
`
