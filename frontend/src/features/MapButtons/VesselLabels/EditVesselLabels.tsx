import { Content, Header } from '@features/MapButtons/shared/styles'
import { SUPER_USER_VESSEL_LABEL_OPTION, VESSEL_LABEL_OPTIONS } from '@features/MapButtons/VesselLabels/constants'
import { useIsSuperUser } from '@hooks/authorization/useIsSuperUser'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { MultiRadio } from '@mtes-mct/monitor-ui'
import { useMemo } from 'react'
import styled from 'styled-components'

import { MapToolType } from '../../../domain/entities/map/constants'
import { setRiskFactorShowedOnMap, setVesselLabel, setVesselLabelsShowedOnMap } from '../../../domain/shared_slices/Map'
import { MapPropertyTrigger } from '../../commonComponents/MapPropertyTrigger'
import RiskFactorSVG from '../../icons/Bouton_afficher_note_de_risque.svg?react'
import LabelSVG from '../../icons/Menu_etiquettes_navires.svg?react'
import { MapToolBox } from '../shared/MapToolBox'

export function EditVesselLabels() {
  const dispatch = useMainAppDispatch()
  const isSuperUser = useIsSuperUser()
  const vesselLabel = useMainAppSelector(state => state.map.vesselLabel)
  const riskFactorShowedOnMap = useMainAppSelector(state => state.map.riskFactorShowedOnMap)
  const vesselLabelsShowedOnMap = useMainAppSelector(state => state.map.vesselLabelsShowedOnMap)
  const mapToolOpened = useMainAppSelector(state => state.global.mapToolOpened)

  const isOpen = useMemo(() => mapToolOpened === MapToolType.VESSEL_LABELS, [mapToolOpened])

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