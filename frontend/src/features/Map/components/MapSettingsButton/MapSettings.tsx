import { MapToolBox } from '@features/Map/components/MapButtons/shared/MapToolBox'
import { VESSEL_LABEL_OPTIONS } from '@features/Map/components/MapSettingsButton/constants'
import { selectAreVesselsEstimatedPositionsDisplayed, selectIsRiskFactorDisplayed } from '@features/Map/selectors'
import { DISABLED_DURING_POSITION_REPLAY_MESSAGE } from '@features/PositionReplay/constants'
import { DataKind, selectIsDataAvailable } from '@features/PositionReplay/replayableData'
import { startPositionReplay } from '@features/PositionReplay/useCases/startPositionReplay'
import { TrackDepthSelection } from '@features/Vessel/components/VesselSidebar/components/TrackRequest/TrackDepthSelection'
import { displayVesselsEstimatedPositions } from '@features/Vessel/useCases/displayVesselEstimatedPositions'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Accent, Button, Icon, MapMenuDialog, MultiRadio } from '@mtes-mct/monitor-ui'
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
  const showingVesselsEstimatedPositions = useMainAppSelector(selectAreVesselsEstimatedPositionsDisplayed)
  const isSuperUser = useIsSuperUser()
  const vesselLabel = useMainAppSelector(state => state.map.vesselLabel)
  const riskFactorShowedOnMap = useMainAppSelector(selectIsRiskFactorDisplayed)
  const vesselLabelsShowedOnMap = useMainAppSelector(state => state.map.vesselLabelsShowedOnMap)
  const isRiskFactorAvailable = useMainAppSelector(state => selectIsDataAvailable(state, DataKind.RISK_FACTOR))
  const areEstimatedPositionsAvailable = useMainAppSelector(state =>
    selectIsDataAvailable(state, DataKind.ESTIMATED_POSITIONS)
  )

  const replayPositions = () => {
    dispatch(startPositionReplay())
    onClose()
  }

  return (
    <Wrapper isOpen={isOpened}>
      <Header>
        <CloseButton Icon={Icon.Close} onClick={onClose} title="Fermer" />
        <StyledTitle>Paramètres d'affichage des navires</StyledTitle>
      </Header>
      <StyledMapMenuDialogBody>
        <StyledMultiRadio
          isInline
          label="Libellé des étiquettes des navires"
          name="vesselLabelRadio"
          onChange={nextLabel => {
            dispatch(setVesselLabel(nextLabel as VesselLabel))
          }}
          options={VESSEL_LABEL_OPTIONS}
          value={vesselLabel}
        />
        <StyledTrackDepthSelection
          defaultValue={defaultVesselTrackDepth}
          label="Période d'affichage par défaut des pistes (VMS et AIS)"
          name="global-track-depth"
          onChange={nextValue => dispatch(updateDefaultVesselTrackDepth(nextValue))}
        />
        <Hint>Si le navire n'a pas de message DEP, la longueur par défaut de sa piste sera de 12 heures.</Hint>
        <ReplayButton
          accent={Accent.SECONDARY}
          Icon={Icon.Clock}
          isFullWidth
          onClick={replayPositions}
          title="Rejouer les positions à une date passée"
        >
          Rejouer les positions à une date passée
        </ReplayButton>
      </StyledMapMenuDialogBody>
      <MapPropertyTrigger
        booleanProperty={vesselLabelsShowedOnMap}
        Icon={Icon.Tag}
        text="les étiquettes des navires"
        updateBooleanProperty={isShowed => dispatch(setVesselLabelsShowedOnMap(isShowed))}
      />
      {isSuperUser && (
        <MapPropertyTrigger
          booleanProperty={riskFactorShowedOnMap}
          disabled={!isRiskFactorAvailable}
          disabledReason={DISABLED_DURING_POSITION_REPLAY_MESSAGE}
          Icon={riskFactorShowedOnMap ? Icon.Display : Icon.Hide}
          text="la note de risque des navires"
          updateBooleanProperty={isShowed => dispatch(setRiskFactorShowedOnMap(isShowed))}
        />
      )}
      <MapPropertyTrigger
        booleanProperty={showingVesselsEstimatedPositions}
        disabled={!areEstimatedPositionsAvailable}
        disabledReason={DISABLED_DURING_POSITION_REPLAY_MESSAGE}
        IconSVG={EstimatedPosition as typeof EstimatedPositionSVG}
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

// `TrackDepthSelection` puts its label and its select in a row
const StyledTrackDepthSelection = styled(TrackDepthSelection)`
  margin: 4px 12px 0 12px;

  .Field-Select {
    flex-direction: column;
  }

  .Element-Label {
    line-height: normal;
    margin-right: 0;
  }
`

const StyledMultiRadio = styled(MultiRadio)`
  margin: 4px 12px 16px 12px;
`

const Hint = styled.p`
  color: ${p => p.theme.color.slateGray};
  font-style: italic;
  margin: 4px 12px 24px 12px;
`

const ReplayButton = styled(Button)`
  margin: 0 12px 12px 12px;
  width: calc(100% - 24px);
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
  top: 0;
  width: 406px;
`
