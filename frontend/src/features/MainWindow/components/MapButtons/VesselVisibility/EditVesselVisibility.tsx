import { TrackDepthSelection } from '@features/Vessel/components/VesselSidebar/actions/TrackRequest/TrackDepthSelection'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { LastPositionsSlider } from './LastPositionsSlider'
import { updateDefaultVesselTrackDepth } from '../../../../../domain/use_cases/vessel/updateDefaultVesselTrackDepth'
import { MapPropertyTrigger } from '../../../../commonComponents/MapPropertyTrigger'
import EstimatedPositionSVG from '../../../../icons/Positions_estimees.svg?react'
import {
  setHideVesselsAtPort,
  setVesselsLastPositionVisibility,
  showVesselsEstimatedPositions
} from '../../../../Map/slice'
import { setHideNonSelectedVessels } from '../../../../Vessel/slice'
import { MapToolBox } from '../shared/MapToolBox'
import { Content, Header } from '../shared/styles'

export function EditVesselVisibility({ isOpened }) {
  const dispatch = useMainAppDispatch()
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const hideVesselsAtPort = useMainAppSelector(state => state.map.hideVesselsAtPort)
  const defaultVesselTrackDepth = useMainAppSelector(state => state.map.defaultVesselTrackDepth)
  const showingVesselsEstimatedPositions = useMainAppSelector(state => state.map.showingVesselsEstimatedPositions)
  const vesselsLastPositionVisibility = useMainAppSelector(state => state.map.vesselsLastPositionVisibility)

  const updateVesselsLastPositionVisibility = (hidden, opacityReduced) => {
    dispatch(
      setVesselsLastPositionVisibility({
        hidden,
        opacityReduced
      })
    )
  }

  return (
    <Wrapper $isOpen={isOpened}>
      <Header $isFirst>Gérer l&apos;affichage des dernières positions</Header>
      <Content>
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
      </Content>
      <Header $isFirst={false}>Paramétrer la longueur par défaut des pistes</Header>
      <Content $hasMargin>
        <TrackDepthSelection
          defaultValue={defaultVesselTrackDepth}
          label="Afficher depuis"
          name="global-track-depth"
          onChange={nextValue => dispatch(updateDefaultVesselTrackDepth(nextValue))}
        />
      </Content>
      <MapPropertyTrigger
        booleanProperty={showingVesselsEstimatedPositions}
        IconSVG={EstimatedPosition}
        text="les positions estimées des navires"
        updateBooleanProperty={isShowed => dispatch(showVesselsEstimatedPositions(isShowed))}
      />
      <MapPropertyTrigger
        booleanProperty={hideNonSelectedVessels}
        Icon={hideNonSelectedVessels ? Icon.Display : Icon.Hide}
        inverse
        text="les navires non sélectionnés"
        updateBooleanProperty={isHidden => dispatch(setHideNonSelectedVessels(isHidden))}
      />
      <MapPropertyTrigger
        booleanProperty={hideVesselsAtPort}
        Icon={Icon.Anchor}
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
  color: ${THEME.color.slateGray};
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
  background: ${THEME.color.charcoal};
  border: unset;
  display: inline-block;
  height: 3px;
  margin-bottom: 1px;
  margin-left: 25px;
  margin-right: 5px;
  width: 8px;
`

const LastPositionInfo = styled.div`
  color: ${THEME.color.gunMetal};
  font-size: 10px;
  margin: 16px;
`

const Wrapper = styled(MapToolBox)`
  top: 172px;
  width: 406px;
`
