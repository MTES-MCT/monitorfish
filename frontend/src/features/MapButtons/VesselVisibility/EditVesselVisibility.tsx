import { useMemo } from 'react'
import styled from 'styled-components'

import { LastPositionsSlider } from './LastPositionsSlider'
import TrackDepthRadio from './TrackDepthRadio'
import { COLORS } from '../../../constants/constants'
import { MapToolType } from '../../../domain/entities/map/constants'
import {
  setHideVesselsAtPort,
  setVesselsLastPositionVisibility,
  showVesselsEstimatedPositions
} from '../../../domain/shared_slices/Map'
import { setHideNonSelectedVessels } from '../../../domain/shared_slices/Vessel'
import { useMainAppDispatch } from '../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../hooks/useMainAppSelector'
import { MapPropertyTrigger } from '../../commonComponents/MapPropertyTrigger'
import { ReactComponent as HidingOtherTracksSVG } from '../../icons/Bouton_masquer_pistes_actif.svg'
import { ReactComponent as ShowingOtherTracksSVG } from '../../icons/Bouton_masquer_pistes_inactif.svg'
import { ReactComponent as HideVesselsAtPortSVG } from '../../icons/Masquer_navires_au_port.svg'
import { ReactComponent as EstimatedPositionSVG } from '../../icons/Positions_estimees.svg'
import { MapToolBox } from '../shared/MapToolBox'

export function EditVesselVisibility() {
  const dispatch = useMainAppDispatch()
  const { hideNonSelectedVessels } = useMainAppSelector(state => state.vessel)
  const { mapToolOpened } = useMainAppSelector(state => state.global)
  const { hideVesselsAtPort, showingVesselsEstimatedPositions, vesselsLastPositionVisibility } = useMainAppSelector(
    state => state.map
  )

  const isOpen = useMemo(() => mapToolOpened === MapToolType.VESSEL_VISIBILITY, [mapToolOpened])

  const updateVesselsLastPositionVisibility = (hidden, opacityReduced) => {
    dispatch(
      setVesselsLastPositionVisibility({
        hidden,
        opacityReduced
      })
    )
  }

  return (
    <Wrapper isOpen={isOpen}>
      <Header isFirst>Gérer l&apos;affichage des dernières positions</Header>
      <LastPositionInfo>
        <VesselHidden /> navires masqués <VesselAlmostHidden /> navires estompés <VesselShowed /> navires normaux
      </LastPositionInfo>
      <LastPositionsSlider
        updateVesselsLastPositionVisibility={updateVesselsLastPositionVisibility}
        vesselsLastPositionVisibility={vesselsLastPositionVisibility}
      />
      <LastPositionLegend>
        Ces seuils permettent de régler l&apos;affichage, l&apos;estompage et le masquage des dernières positions des
        navires.
      </LastPositionLegend>
      <Header isFirst={false}>Paramétrer la longueur par défaut des pistes</Header>
      <TrackDepthRadio />
      <MapPropertyTrigger
        booleanProperty={showingVesselsEstimatedPositions}
        Icon={EstimatedPosition}
        text="les positions estimées des navires"
        updateBooleanProperty={isShowed => dispatch(showVesselsEstimatedPositions(isShowed))}
      />
      <MapPropertyTrigger
        booleanProperty={hideNonSelectedVessels}
        Icon={hideNonSelectedVessels ? ShowingOtherTracksSVG : HidingOtherTracksSVG}
        inverse
        text="les navires non sélectionnés"
        updateBooleanProperty={isHidden => dispatch(setHideNonSelectedVessels(isHidden))}
      />
      <MapPropertyTrigger
        booleanProperty={hideVesselsAtPort}
        Icon={HideVesselsAtPortSVG}
        inverse
        text="les navires au port"
        updateBooleanProperty={isHidden => dispatch(setHideVesselsAtPort(isHidden))}
      />
    </Wrapper>
  )
}

const EstimatedPosition = styled(EstimatedPositionSVG)`
  width: 10px;
`

const LastPositionLegend = styled.div`
  color: ${COLORS.slateGray};
  font-size: 13px;
  margin: 5px 5px 15px 25px;
  text-align: left;
`

const VesselHidden = styled.span`
  background: #cccfd6;
  border: unset;
  display: inline-block;
  height: 3px;
  margin-bottom: 1px;
  margin-right: 5px;
  width: 8px;
`

const VesselAlmostHidden = styled.span`
  background: #9095a2;
  border: unset;
  display: inline-block;
  height: 3px;
  margin-bottom: 1px;
  margin-left: 25px;
  margin-right: 5px;
  width: 8px;
`

const VesselShowed = styled.span`
  background: ${COLORS.charcoal};
  border: unset;
  display: inline-block;
  height: 3px;
  margin-bottom: 1px;
  margin-left: 25px;
  margin-right: 5px;
  width: 8px;
`

const LastPositionInfo = styled.div`
  color: ${COLORS.gunMetal};
  font-size: 10px;
  margin: 15px;
`

const Header = styled.div<{
  isFirst: boolean
}>`
  background: ${COLORS.charcoal};
  border-top-left-radius: ${p => (p.isFirst ? '2px' : '0')};
  border-top-right-radius: ${p => (p.isFirst ? '2px' : '0')};
  color: ${COLORS.gainsboro};
  font-size: 16px;
  padding: 9px 0 7px 15px;
  text-align: left;
`

const Wrapper = styled(MapToolBox)<{
  isHidden?: boolean
  isOpen: boolean
}>`
  top: 152px;
  width: 406px;
`
