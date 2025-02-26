import { MapPropertyTrigger } from '@features/commonComponents/MapPropertyTrigger'
import { MapBox } from '@features/Map/constants'
import { useDisplayMapBox } from '@hooks/useDisplayMapBox'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, MultiRadio } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { SUPER_USER_VESSEL_LABEL_OPTION, VESSEL_LABEL_OPTIONS } from './constants'
import { useIsSuperUser } from '../../../../../auth/hooks/useIsSuperUser'
import { setRiskFactorShowedOnMap, setVesselLabel, setVesselLabelsShowedOnMap } from '../../../../Map/slice'
import { MapToolBox } from '../shared/MapToolBox'
import { Content, Header } from '../shared/styles'

export function EditVesselLabels() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const vesselLabel = useMainAppSelector(state => state.map.vesselLabel)
  const riskFactorShowedOnMap = useMainAppSelector(state => state.map.riskFactorShowedOnMap)
  const vesselLabelsShowedOnMap = useMainAppSelector(state => state.map.vesselLabelsShowedOnMap)
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)
  const { isOpened, isRendered } = useDisplayMapBox(rightMapBoxOpened === MapBox.VESSEL_LABELS)

  return (
    isRendered && (
      <Wrapper $isOpen={isOpened}>
        <Header>Affichage des étiquettes {isSuperUser ? 'et notes des navires' : ''}</Header>
        <Content $hasMargin>
          <MultiRadio
            label="Choisir le libellé des étiquettes des navires"
            name="vesselLabelRadio"
            onChange={nextLabel => {
              dispatch(setVesselLabel(nextLabel as string))
            }}
            options={isSuperUser ? VESSEL_LABEL_OPTIONS.concat(SUPER_USER_VESSEL_LABEL_OPTION) : VESSEL_LABEL_OPTIONS}
            value={vesselLabel}
          />
        </Content>
        <MapPropertyTrigger
          booleanProperty={vesselLabelsShowedOnMap}
          Icon={Icon.Tag}
          text="les étiquettes des navires"
          updateBooleanProperty={isShowed => dispatch(setVesselLabelsShowedOnMap(isShowed))}
        />
        {isSuperUser && (
          <MapPropertyTrigger
            booleanProperty={riskFactorShowedOnMap}
            Icon={riskFactorShowedOnMap ? Icon.Display : Icon.Hide}
            text="la note de risque des navires"
            updateBooleanProperty={isShowed => dispatch(setRiskFactorShowedOnMap(isShowed))}
          />
        )}
      </Wrapper>
    )
  )
}

const Wrapper = styled(MapToolBox)`
  width: 406px;
  top: 220px;
`
