import { MapToolBox } from '@features/MainWindow/components/MapButtons/shared/MapToolBox'
import { MapToolButton } from '@features/MainWindow/components/MapButtons/shared/MapToolButton'
import { MapBox } from '@features/Map/constants'
import { NewFeature } from '@features/NewFeatures/components/NewFeature'
import { NEW_FEATURES } from '@features/NewFeatures/constants'
import { getFeaturesByMonths, isFeatureDisplayed } from '@features/NewFeatures/utils'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, MapMenuDialog } from '@mtes-mct/monitor-ui'
import { findIndex } from 'lodash-es'
import { useMemo } from 'react'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../auth/hooks/useIsSuperUser'
import { setRightMapBoxOpened } from '../../../domain/shared_slices/Global'

const MARGIN_BOTTOM = 357

export function NewFeatures() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.NEW_FEATURES)

  const openOrClose = () => {
    dispatch(setRightMapBoxOpened(rightMapBoxOpened === MapBox.NEW_FEATURES ? undefined : MapBox.NEW_FEATURES))
  }

  const features = useMemo(() => {
    const featuresByMonths = getFeaturesByMonths(NEW_FEATURES)

    return Object.keys(featuresByMonths)
      .map((date, dateIndex) => {
        const currentFeatures = featuresByMonths[date]
        if (currentFeatures === undefined) {
          return undefined
        }

        const firstDisplayedIndex = findIndex(currentFeatures, isFeatureDisplayed(isSuperUser), 0)

        return currentFeatures.map((feature, index) => {
          if (!isFeatureDisplayed(isSuperUser)(feature)) {
            return undefined
          }

          return (
            <NewFeature
              date={date}
              feature={feature}
              isDateDisplayed={index === firstDisplayedIndex}
              isFirstItem={index === firstDisplayedIndex && dateIndex === 0}
            />
          )
        })
      })
      .filter(feature => feature)
      .filter(feature => feature)
  }, [isSuperUser])

  return (
    <Wrapper>
      {isRendered && (
        <MapMenuDialogWrapper $hideBoxShadow $isOpen={isOpened} data-cy="map-new-features-box">
          <StyledContainer>
            <MapMenuDialog.Header>
              <MapMenuDialog.Title>Nouveautés MonitorFish</MapMenuDialog.Title>
            </MapMenuDialog.Header>
            <StyledBody>{features}</StyledBody>
          </StyledContainer>
        </MapMenuDialogWrapper>
      )}
      <MapToolButton
        Icon={Icon.NewFeatures}
        isActive={rightMapBoxOpened === MapBox.NEW_FEATURES}
        onClick={openOrClose}
        style={{ bottom: MARGIN_BOTTOM }}
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

const MapMenuDialogWrapper = styled(MapToolBox)`
  bottom: ${MARGIN_BOTTOM}px;
`
