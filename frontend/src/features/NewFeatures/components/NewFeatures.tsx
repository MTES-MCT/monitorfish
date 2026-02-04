import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { NewFeature } from '@features/NewFeatures/components/NewFeature'
import { NEW_FEATURES } from '@features/NewFeatures/constants'
import { getFeaturesByMonths, isFeatureDisplayed } from '@features/NewFeatures/utils'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { Icon, MapMenuDialog, THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { setRightMapBoxDisplayed } from '../../../domain/use_cases/setRightMapBoxDisplayed'

export function NewFeatures() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const checkedFeatures = useMainAppSelector(state => state.newFeatures.checkedFeatures)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.NEW_FEATURES)

  useEffect(() => {
    if (isRendered) {
      trackEvent({
        action: `Ouverture de la vue "Nouveautés MonitorFish"`,
        category: 'DISPLAY_FEATURE',
        name: isSuperUser ? 'CNSP' : 'EXT'
      })
    }
  }, [isRendered, isSuperUser])

  const openOrClose = () => {
    dispatch(setRightMapBoxDisplayed(rightMapBoxOpened === MapBox.NEW_FEATURES ? undefined : MapBox.NEW_FEATURES))
  }

  const authorizedFeatures = useMemo(() => NEW_FEATURES.filter(isFeatureDisplayed(isSuperUser)), [isSuperUser])

  const features = useMemo(() => {
    const featuresByMonths = getFeaturesByMonths(authorizedFeatures)

    return Object.keys(featuresByMonths)
      .map((date, dateIndex) => {
        const currentFeatures = featuresByMonths[date]
        if (currentFeatures === undefined) {
          return undefined
        }

        return currentFeatures.map((feature, index) => (
          <NewFeature
            key={feature.date + feature.title}
            date={date}
            feature={feature}
            isDateDisplayed={index === 0}
            isFirstItem={index === 0 && dateIndex === 0}
          />
        ))
      })
      .filter(feature => feature)
  }, [authorizedFeatures])

  return (
    <>
      <MapToolButton
        badgeBackgroundColor={THEME.color.blueGray}
        badgeNumber={
          checkedFeatures.length !== authorizedFeatures.length
            ? authorizedFeatures.length - checkedFeatures.length
            : undefined
        }
        Icon={Icon.NewFeatures}
        isActive={isOpened}
        onClick={openOrClose}
        title="Nouveautés MonitorFish"
      />
      {isRendered && (
        <StyledMapToolBox $hideBoxShadow $isOpen={isOpened} data-cy="map-new-features-box">
          <StyledContainer>
            <MapMenuDialog.Header>
              <MapMenuDialog.Title>Nouveautés MonitorFish</MapMenuDialog.Title>
            </MapMenuDialog.Header>
            <StyledBody>{features}</StyledBody>
          </StyledContainer>
        </StyledMapToolBox>
      )}
    </>
  )
}

const StyledMapToolBox = styled(MapToolBox)`
  margin-top: -48px;
`

const StyledContainer = styled(MapMenuDialog.Container)`
  margin-right: unset;
  max-height: 450px;
`

const StyledBody = styled(MapMenuDialog.Body)`
  padding: 0;
`
