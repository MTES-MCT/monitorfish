import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/Map/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { NewFeature } from '@features/NewFeatures/components/NewFeature'
import { NEW_FEATURES } from '@features/NewFeatures/constants'
import { getFeaturesByMonths, isFeatureDisplayed } from '@features/NewFeatures/utils'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useGetTopOffset } from '@hooks/useGetTopOffset'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { trackEvent } from '@hooks/useTracking'
import { Icon, MapMenuDialog, THEME } from '@mtes-mct/monitor-ui'
import { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { displayedComponentActions } from '../../../domain/shared_slices/DisplayedComponent'
import { setRightMapBoxDisplayed } from '../../../domain/use_cases/setRightMapBoxDisplayed'

const MARGIN_TOP = 460

export function NewFeatures() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const marginTop = useGetTopOffset()
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
    if (!rightMapBoxOpened) {
      dispatch(displayedComponentActions.setDisplayedComponents({ isControlUnitListDialogDisplayed: false }))
    }

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
    <Wrapper>
      {isRendered && (
        <MapMenuDialogWrapper $hideBoxShadow $isOpen={isOpened} $marginTop={marginTop} data-cy="map-new-features-box">
          <StyledContainer>
            <MapMenuDialog.Header>
              <MapMenuDialog.Title>Nouveautés MonitorFish</MapMenuDialog.Title>
            </MapMenuDialog.Header>
            <StyledBody>{features}</StyledBody>
          </StyledContainer>
        </MapMenuDialogWrapper>
      )}
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
        style={{ top: MARGIN_TOP }}
        title="Nouveautés MonitorFish"
      />
    </Wrapper>
  )
}

const StyledContainer = styled(MapMenuDialog.Container)`
  margin-right: unset;
  max-height: 450px;
`

const StyledBody = styled(MapMenuDialog.Body)`
  padding: 0;
`

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 98;
  left: 10px;

  * {
    box-sizing: border-box;
  }
`

const MapMenuDialogWrapper = styled(MapToolBox)<{
  $marginTop: number
}>`
  bottom: calc(100vh - ${p => p.$marginTop}px - 40px - ${MARGIN_TOP}px);
`
