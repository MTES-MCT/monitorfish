import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { VESSEL_LABEL_OPTIONS } from '@features/Map/components/MapSettingsButton/constants'
import { TrackDepthSelection } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/TrackDepthSelection'
import { displayVesselsEstimatedPositions } from '@features/Vessel/useCases/displayVesselEstimatedPositions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, MapMenuDialog, MultiRadio } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { useIsSuperUser } from '../../../../auth/hooks/useIsSuperUser'
import { MapPropertyTrigger } from '../../../commonComponents/MapPropertyTrigger'
import EstimatedPositionSVG from '../../../icons/Positions_estimees.svg?react'
import { setHideNonSelectedVessels } from '../../../Vessel/slice'
import { updateDefaultVesselTrackDepth } from '../../../Vessel/useCases/updateDefaultVesselTrackDepth'
import { setRiskFactorShowedOnMap, setVesselLabel, setVesselLabelsShowedOnMap } from '../../slice'

import type { VesselLabel } from '@features/Vessel/label.types'

export function MapSettings({ isOpened, onClose }) {
  const dispatch = useMainAppDispatch()
  const hideNonSelectedVessels = useMainAppSelector(state => state.vessel.hideNonSelectedVessels)
  const defaultVesselTrackDepth = useMainAppSelector(state => state.map.defaultVesselTrackDepth)
  const showingVesselsEstimatedPositions = useMainAppSelector(state => state.map.showingVesselsEstimatedPositions)
  const isSuperUser = useIsSuperUser()
  const vesselLabel = useMainAppSelector(state => state.map.vesselLabel)
  const riskFactorShowedOnMap = useMainAppSelector(state => state.map.riskFactorShowedOnMap)
  const vesselLabelsShowedOnMap = useMainAppSelector(state => state.map.vesselLabelsShowedOnMap)

  return (
    <Wrapper isOpen={isOpened}>
      <Header>
        <CloseButton Icon={Icon.Close} onClick={onClose} title="Fermer" />
        <StyledTitle>Paramétrer la longueur par défaut des pistes</StyledTitle>
      </Header>
      <StyledMapMenuDialogBody>
        <StyledTrackDepthSelection
          defaultValue={defaultVesselTrackDepth}
          label="Afficher depuis"
          name="global-track-depth"
          onChange={nextValue => dispatch(updateDefaultVesselTrackDepth(nextValue))}
        />
      </StyledMapMenuDialogBody>
      <Header $isCentered>
        <StyledTitle>Affichage des étiquettes et notes des navires</StyledTitle>
      </Header>
      <MapMenuDialog.Body>
        <StyledMultiRadio
          label="Choisir le libellé des étiquettes des navires"
          name="vesselLabelRadio"
          onChange={nextLabel => {
            dispatch(setVesselLabel(nextLabel as VesselLabel))
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
const StyledMapMenuDialogBody = styled(MapMenuDialog.Body)`
  overflow-y: visible;
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

const Wrapper = styled(MapToolBox)`
  width: 406px;
`
