import { MapToolBox } from '@features/MainWindow/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { NewFeature } from '@features/NewFeatures/components/NewFeature'
import { NEW_FEATURES } from '@features/NewFeatures/constants'
import { getFeaturesByMonths, isFeatureDisplayed } from '@features/NewFeatures/utils'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, MapMenuDialog, THEME } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { setRightMapBoxOpened } from '../../../domain/shared_slices/Global'

const MARGIN_TOP = 476

export function NewFeatures() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const healthcheckTextWarning = useMainAppSelector(state => state.global.healthcheckTextWarning)
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const checkedFeatures = useMainAppSelector(state => state.newFeatures.checkedFeatures)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.NEW_FEATURES)

  const openOrClose = () => {
    dispatch(setRightMapBoxOpened(rightMapBoxOpened === MapBox.NEW_FEATURES ? undefined : MapBox.NEW_FEATURES))
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
        <MapMenuDialogWrapper
          $hasHealthcheckTextWarning={!!healthcheckTextWarning.length}
          $hideBoxShadow
          $isOpen={isOpened}
          data-cy="map-new-features-box"
        >
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
  $hasHealthcheckTextWarning: boolean
}>`
  bottom: calc(100vh - ${p => (p.$hasHealthcheckTextWarning ? 50 : 0)}px - 40px - ${MARGIN_TOP}px);
`
