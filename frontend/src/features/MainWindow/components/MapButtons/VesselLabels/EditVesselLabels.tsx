import { useIsSuperUser } from '@hooks/authorization/useIsSuperUser'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { MultiRadio } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { SUPER_USER_VESSEL_LABEL_OPTION, VESSEL_LABEL_OPTIONS } from './constants'
import { MapBox } from '../../../../../domain/entities/map/constants'
import {
  setRiskFactorShowedOnMap,
  setVesselLabel,
  setVesselLabelsShowedOnMap
} from '../../../../../domain/shared_slices/Map'
import { MapPropertyTrigger } from '../../../../commonComponents/MapPropertyTrigger'
import RiskFactorSVG from '../../icons/Bouton_afficher_note_de_risque.svg?react'
import LabelSVG from '../../icons/Menu_etiquettes_navires.svg?react'
import { MapToolBox } from '../shared/MapToolBox'
import { Content, Header } from '../shared/styles'

export function EditVesselLabels() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const vesselLabel = useMainAppSelector(state => state.map.vesselLabel)
  const riskFactorShowedOnMap = useMainAppSelector(state => state.map.riskFactorShowedOnMap)
  const vesselLabelsShowedOnMap = useMainAppSelector(state => state.map.vesselLabelsShowedOnMap)
  const rightMapBoxOpened = useMainAppSelector(state => state.global.rightMapBoxOpened)

  const isOpen = useMemo(() => rightMapBoxOpened === MapBox.VESSEL_LABELS, [rightMapBoxOpened])

  return (
    <Wrapper isOpen={isOpen}>
      <Header>Affichage des étiquettes {isSuperUser ? 'et notes des navires' : ''}</Header>
      <Content hasMargin>
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
        Icon={LabelSVG}
        text="les étiquettes des navires"
        updateBooleanProperty={isShowed => dispatch(setVesselLabelsShowedOnMap(isShowed))}
      />
      {isSuperUser && (
        <MapPropertyTrigger
          booleanProperty={riskFactorShowedOnMap}
          Icon={RiskFactorSVG}
          text="la note de risque des navires"
          updateBooleanProperty={isShowed => dispatch(setRiskFactorShowedOnMap(isShowed))}
        />
      )}
    </Wrapper>
  )
}

const Wrapper = styled(MapToolBox)`
  width: 406px;
  top: 194px;
`
