import { useMemo } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../../../constants/constants'
import LastPositionsSlider from './LastPositionsSlider'
import {
  setHideVesselsAtPort,
  setVesselsLastPositionVisibility,
  showVesselsEstimatedPositions
} from '../../../../domain/shared_slices/Map'
import TrackDepthRadio from './TrackDepthRadio'
import { MapComponentStyle } from '../../../commonStyles/MapComponent.style'
import { setHideNonSelectedVessels } from '../../../../domain/shared_slices/Vessel'
import { ReactComponent as HidingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_actif.svg'
import { ReactComponent as ShowingOtherTracksSVG } from '../../../icons/Bouton_masquer_pistes_inactif.svg'
import { ReactComponent as HideVesselsAtPortSVG } from '../../../icons/Masquer_navires_au_port.svg'
import { ReactComponent as EstimatedPositionSVG } from '../../../icons/Positions_estimees.svg'
import MapPropertyTrigger from '../../../commonComponents/MapPropertyTrigger'
import { MapTool } from '../../../../domain/entities/map'
import { MapToolBox } from '../MapToolBox'

const EditVesselVisibility = () => {
  const dispatch = useDispatch()
  const {
    hideNonSelectedVessels
  } = useSelector(state => state.vessel)
  const {
    healthcheckTextWarning,
    mapToolOpened
  } = useSelector(state => state.global)
  const {
    showingVesselsEstimatedPositions,
    hideVesselsAtPort,
    vesselsLastPositionVisibility
  } = useSelector(state => state.map)

  const isOpen = useMemo(() => mapToolOpened === MapTool.VESSEL_VISIBILITY, [mapToolOpened])

  const updateVesselsLastPositionVisibility = (hidden, opacityReduced) => {
    dispatch(setVesselsLastPositionVisibility({
      opacityReduced: opacityReduced,
      hidden: hidden
    }))
  }

  return (
    <Wrapper
      healthcheckTextWarning={healthcheckTextWarning}
      isOpen={isOpen}>
      <Header isFirst={true}>
        Gérer l&apos;affichage des dernières positions
      </Header>
      <LastPositionInfo>
        <VesselHidden/> navires masqués <VesselAlmostHidden/> navires estompés <VesselShowed/> navires normaux
      </LastPositionInfo>
      <LastPositionsSlider
        updateVesselsLastPositionVisibility={updateVesselsLastPositionVisibility}
        vesselsLastPositionVisibility={vesselsLastPositionVisibility}
      />
      <LastPositionLegend>
        Ces seuils permettent de régler l&apos;affichage, l&apos;estompage et le masquage des dernières positions des
        navires.
      </LastPositionLegend>
      <Header isFirst={false}>
        Paramétrer la longueur par défaut des pistes
      </Header>
      <TrackDepthRadio/>
      <MapPropertyTrigger
        booleanProperty={showingVesselsEstimatedPositions}
        updateBooleanProperty={isShowed => dispatch(showVesselsEstimatedPositions(isShowed))}
        text={'les positions estimées des navires'}
        Icon={EstimatedPosition}
      />
      <MapPropertyTrigger
        inverse
        booleanProperty={hideNonSelectedVessels}
        updateBooleanProperty={isHidden => dispatch(setHideNonSelectedVessels(isHidden))}
        text={'les navires non sélectionnés'}
        Icon={hideNonSelectedVessels ? ShowingOtherTracksSVG : HidingOtherTracksSVG}
      />
      <MapPropertyTrigger
        inverse
        booleanProperty={hideVesselsAtPort}
        updateBooleanProperty={isHidden => dispatch(setHideVesselsAtPort(isHidden))}
        text={'les navires au port'}
        Icon={HideVesselsAtPortSVG}
      />
    </Wrapper>
  )
}

const EstimatedPosition = styled(EstimatedPositionSVG)`
  width: 10px;
`

const LastPositionLegend = styled.div`
  margin: 5px 5px 15px 25px;
  font-size: 13px;
  color: ${COLORS.slateGray};
  text-align: left;
`

const VesselHidden = styled.span`
  background: #CCCFD6;
  border: unset;
  margin-right: 5px;
  width: 8px;
  height: 3px;
  display: inline-block;
  margin-bottom: 1px;
`

const VesselAlmostHidden = styled.span`
  background: #9095A2;
  border: unset;
  margin-right: 5px;
  margin-left: 25px;
  width: 8px;
  height: 3px;
  display: inline-block;
  margin-bottom: 1px;
`

const VesselShowed = styled.span`
  background: ${COLORS.charcoal};
  border: unset;
  margin-right: 5px;
  margin-left: 25px;
  width: 8px;
  height: 3px;
  display: inline-block;
  margin-bottom: 1px;
`

const LastPositionInfo = styled.div`
  font-size: 10px;
  margin: 15px;
  color: ${COLORS.gunMetal};
`

const Header = styled.div`
  background: ${COLORS.charcoal};
  color: ${COLORS.gainsboro};
  padding: 9px 0 7px 15px;
  font-size: 16px;
  text-align: left;
  border-top-left-radius: ${props => props.isFirst ? '2px' : '0'};
  border-top-right-radius: ${props => props.isFirst ? '2px' : '0'};
`

const Wrapper = styled(MapToolBox)`
  width: 406px;
  top: 152px;
`

export default EditVesselVisibility
