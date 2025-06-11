import { VESSEL_LABEL_OPTIONS } from '@features/MainWindow/components/MapButtons/VesselVisibility/constants'
import { TrackDepthSelection } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/TrackDepthSelection'
import { displayVesselsEstimatedPositions } from '@features/Vessel/useCases/displayVesselEstimatedPositions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, MapMenuDialog, MultiRadio, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { LastPositionsVisibilitySlider } from './LastPositionsVisibilitySlider'
import { useIsSuperUser } from '../../../../../auth/hooks/useIsSuperUser'
import { MapPropertyTrigger } from '../../../../commonComponents/MapPropertyTrigger'
import EstimatedPositionSVG from '../../../../icons/Positions_estimees.svg?react'
import { setRiskFactorShowedOnMap, setVesselLabel, setVesselLabelsShowedOnMap } from '../../../../Map/slice'
import { setHideNonSelectedVessels } from '../../../../Vessel/slice'
import { updateDefaultVesselTrackDepth } from '../../../../Vessel/useCases/updateDefaultVesselTrackDepth'
import { MapToolBox } from '../shared/MapToolBox'

export function EditVesselVisibility({ isOpened, onClose }) {
  const dispatch = useMainAppDispatch()
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const defaultVesselTrackDepth = useMainAppSelector(state => state.map.defaultVesselTrackDepth)
  const showingVesselsEstimatedPositions = useMainAppSelector(state => state.map.showingVesselsEstimatedPositions)
  const isSuperUser = useIsSuperUser()
  const vesselLabel = useMainAppSelector(state => state.map.vesselLabel)
  const riskFactorShowedOnMap = useMainAppSelector(state => state.map.riskFactorShowedOnMap)
  const vesselLabelsShowedOnMap = useMainAppSelector(state => state.map.vesselLabelsShowedOnMap)

  return (
    <Wrapper $isOpen={isOpened}>
      <Header>
        <CloseButton Icon={Icon.Close} onClick={onClose} />
        <StyledTitle>Gérer l&apos;affichage des dernières positions</StyledTitle>
      </Header>
      <MapMenuDialog.Body>
        <LastPositionInfo>
          <VesselHidden /> navires masqués <VesselAlmostHidden /> navires estompés <VesselShowed /> navires normaux
        </LastPositionInfo>
        <LastPositionsVisibilitySlider />
        <LastPositionLegend>
          Ces seuils permettent de régler l&apos;affichage, l&apos;estompage et le masquage des dernières positions des
          navires.
        </LastPositionLegend>
      </MapMenuDialog.Body>
      <Header $isCentered>
        <StyledTitle>Paramétrer la longueur par défaut des pistes</StyledTitle>
      </Header>
      <MapMenuDialog.Body>
        <StyledTrackDepthSelection
          defaultValue={defaultVesselTrackDepth}
          label="Afficher depuis"
          name="global-track-depth"
          onChange={nextValue => dispatch(updateDefaultVesselTrackDepth(nextValue))}
        />
      </MapMenuDialog.Body>
      <Header $isCentered>
        <StyledTitle>Affichage des étiquettes et notes des navires</StyledTitle>
      </Header>
      <MapMenuDialog.Body>
        <StyledMultiRadio
          label="Choisir le libellé des étiquettes des navires"
          name="vesselLabelRadio"
          onChange={nextLabel => {
            dispatch(setVesselLabel(nextLabel as string))
          }}
          options={VESSEL_LABEL_OPTIONS}
          value={vesselLabel}
        />
      </MapMenuDialog.Body>
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
      <MapPropertyTrigger
        booleanProperty={showingVesselsEstimatedPositions}
        IconSVG={EstimatedPosition}
        text="les positions estimées des navires"
        updateBooleanProperty={isShowed => dispatch(displayVesselsEstimatedPositions(isShowed))}
      />
      <MapPropertyTrigger
        booleanProperty={hideNonSelectedVessels}
        Icon={hideNonSelectedVessels ? Icon.Display : Icon.Hide}
        inverse
        text="les navires non sélectionnés"
        updateBooleanProperty={isHidden => dispatch(setHideNonSelectedVessels(isHidden))}
      />
    </Wrapper>
  )
}

const StyledTrackDepthSelection = styled(TrackDepthSelection)`
  margin: 4px 12px;
`

const StyledMultiRadio = styled(MultiRadio)`
  margin: 4px 12px 12px 12px;
`

const Header = styled(MapMenuDialog.Header)<{
  $isCentered?: boolean
}>`
  height: 22px;
  justify-content: ${p => (p.$isCentered ? 'center' : 'unset')};
  padding-left: ${p => (p.$isCentered ? 0 : 8)}px;
`

const StyledTitle = styled(MapMenuDialog.Title)``

const CloseButton = styled(MapMenuDialog.CloseButton)`
  margin-top: 4px;
  margin-right: 12px;
  padding-left: 2px;
`

const EstimatedPosition = styled(EstimatedPositionSVG)`
  width: 10px;
`

const LastPositionLegend = styled.div`
  color: ${THEME.color.slateGray};
  margin: 0 12px 12px 12px;
  text-align: left;
`

const VesselHidden = styled.span`
  background: ${THEME.color.lightGray};
  display: inline-block;
  border-radius: 50%;
  height: 8px;
  margin-bottom: 1px;
  margin-right: 2px;
  width: 8px;
  vertical-align: middle;
`

const VesselAlmostHidden = styled.span`
  background: #9095a2;
  border-radius: 50%;
  height: 8px;
  display: inline-block;
  margin-bottom: 1px;
  margin-left: 30px;
  margin-right: 2px;
  width: 8px;
  vertical-align: middle;
`

const VesselShowed = styled.span`
  background: ${THEME.color.charcoal};
  border-radius: 50%;
  height: 8px;
  display: inline-block;
  margin-bottom: 1px;
  margin-left: 30px;
  margin-right: 2px;
  width: 8px;
  vertical-align: middle;
`

const LastPositionInfo = styled.div`
  color: ${THEME.color.gunMetal};
  font-size: 10px;
  margin: 8px 16px 16px 16px;
`

const Wrapper = styled(MapToolBox)`
  top: 172px;
  width: 406px;
`
