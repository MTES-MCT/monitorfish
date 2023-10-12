import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { VesselLabelSelection } from './VesselLabelSelection'
import { COLORS } from '../../../constants/constants'
import { MapToolType } from '../../../domain/entities/map/constants'
import { setRiskFactorShowedOnMap, setVesselLabel, setVesselLabelsShowedOnMap } from '../../../domain/shared_slices/Map'
import { useIsSuperUser } from '../../../hooks/authorization/useIsSuperUser'
import { MapPropertyTrigger } from '../../commonComponents/MapPropertyTrigger'
import RiskFactorSVG from '../../icons/Bouton_afficher_note_de_risque.svg?react'
import LabelSVG from '../../icons/Menu_etiquettes_navires.svg?react'
import { MapToolBox } from '../shared/MapToolBox'

function EditVesselLabels() {
  const dispatch = useDispatch()
  const isSuperUser = useIsSuperUser()
  const vesselLabel = useSelector(state => state.map.vesselLabel)
  const { riskFactorShowedOnMap, vesselLabelsShowedOnMap } = useSelector(state => state.map)
  const { mapToolOpened } = useSelector(state => state.global)

  const isOpen = useMemo(() => mapToolOpened === MapToolType.VESSEL_LABELS, [mapToolOpened])

  return (
    <Wrapper isOpen={isOpen}>
      <Header isFirst={false}>Affichage des étiquettes {isSuperUser ? 'et notes des navires' : ''}</Header>
      <VesselLabel>Choisir le libellé des étiquettes des navires</VesselLabel>
      <VesselLabelSelection
        isSuperUser={isSuperUser}
        updateVesselLabel={label => dispatch(setVesselLabel(label))}
        vesselLabel={vesselLabel}
      />
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

const VesselLabel = styled.div`
  margin: 15px 5px 3px 20px;
  font-size: 13px;
  color: ${COLORS.slateGray};
  text-align: left;
`

const Header = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${props => (props.isFirst ? '2px' : '0')};
  border-top-right-radius: ${props => (props.isFirst ? '2px' : '0')};
`

const Wrapper = styled(MapToolBox)`
  width: 406px;
  top: 194px;
`

export default EditVesselLabels
