import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'

import { ReactComponent as LabelSVG } from '../icons/Menu_etiquettes_navires.svg'
import { ReactComponent as RiskFactorSVG } from '../icons/Bouton_afficher_note_de_risque.svg'
import { COLORS } from '../../constants/constants'
import { setRiskFactorShowedOnMap, setVesselLabel, setVesselLabelsShowedOnMap } from '../../domain/shared_slices/Map'
import VesselLabelSelection from './VesselLabelSelection'
import MapPropertyTrigger from '../commonComponents/MapPropertyTrigger'
import { expandRightMenu } from '../../domain/shared_slices/Global'
import unselectVessel from '../../domain/use_cases/unselectVessel'
import { MapComponentStyle } from '../commonStyles/MapComponent.style'
import { MapButtonStyle } from '../commonStyles/MapButton.style'
import { useClickOutsideComponent } from '../../hooks/useClickOutside'

const VesselLabels = () => {
  const dispatch = useDispatch()
  const selectedVessel = useSelector(state => state.vessel.selectedVessel)
  const rightMenuIsOpen = useSelector(state => state.global.rightMenuIsOpen)
  const vesselLabel = useSelector(state => state.map.vesselLabel)
  const {
    vesselLabelsShowedOnMap,
    riskFactorShowedOnMap
  } = useSelector(state => state.map)
  const {
    healthcheckTextWarning,
    previewFilteredVesselsMode
  } = useSelector(state => state.global)

  const [vesselVisibilityBoxIsOpen, setVesselLabelsBoxIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const clickedOutsideComponent = useClickOutsideComponent(wrapperRef)

  useEffect(() => {
    if (clickedOutsideComponent) {
      setVesselLabelsBoxIsOpen(false)
    }
  }, [clickedOutsideComponent])

  useEffect(() => {
    if (vesselVisibilityBoxIsOpen === true) {
      dispatch(unselectVessel())
    }
  }, [vesselVisibilityBoxIsOpen])

  return (
    <Wrapper ref={wrapperRef}>
      <VesselLabelsIcon
        data-cy={'vessel-labels'}
        isHidden={previewFilteredVesselsMode}
        healthcheckTextWarning={healthcheckTextWarning}
        $rightMenuIsOpen={rightMenuIsOpen}
        $isOpen={vesselVisibilityBoxIsOpen}
        $selectedVessel={selectedVessel}
        onMouseEnter={() => dispatch(expandRightMenu())}
        title={'Affichage des dernières positions'}
        onClick={() => setVesselLabelsBoxIsOpen(!vesselVisibilityBoxIsOpen)}>
        <LabelIcon
          $rightMenuIsOpen={rightMenuIsOpen}
          $selectedVessel={selectedVessel}/>
      </VesselLabelsIcon>
      <VesselLabelsBox
        healthcheckTextWarning={healthcheckTextWarning}
        vesselVisibilityBoxIsOpen={vesselVisibilityBoxIsOpen}>
        <Header isFirst={false}>
          Affichage des étiquettes et notes des navires
        </Header>
        <VesselLabel>
          Choisir le libellé des étiquettes des navires
        </VesselLabel>
        <VesselLabelSelection
          updateVesselLabel={label => dispatch(setVesselLabel(label))}
          vesselLabel={vesselLabel}
        />
        <MapPropertyTrigger
          booleanProperty={vesselLabelsShowedOnMap}
          updateBooleanProperty={isShowed => dispatch(setVesselLabelsShowedOnMap(isShowed))}
          text={'les étiquettes des navires'}
          Icon={LabelSVG}
        />
        <MapPropertyTrigger
          booleanProperty={riskFactorShowedOnMap}
          updateBooleanProperty={isShowed => dispatch(setRiskFactorShowedOnMap(isShowed))}
          text={'la note de risque des navires'}
          Icon={RiskFactorSVG}
        />
      </VesselLabelsBox>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  transition: all 0.2s;
  z-index: 1000;
`

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
  border-top-left-radius: ${props => props.isFirst ? '2px' : '0'};
  border-top-right-radius: ${props => props.isFirst ? '2px' : '0'};
`

const VesselLabelsBox = styled(MapComponentStyle)`
  width: 406px;
  background: ${COLORS.background};
  margin-right: ${props => props.vesselVisibilityBoxIsOpen ? '45px' : '-420px'};
  opacity: ${props => props.vesselVisibilityBoxIsOpen ? '1' : '0'};
  top: 194px;
  right: 10px;
  border-radius: 2px;
  position: absolute;
  display: inline-block;
  transition: all 0.5s;
`

const VesselLabelsIcon = styled(MapButtonStyle)`
  position: absolute;
  display: inline-block;
  color: ${COLORS.blue};
  padding: 0 0px 0 0;
  top: 194px;
  z-index: 99;
  height: 40px;
  width: ${props => props.$selectedVessel && !props.$rightMenuIsOpen ? '5px' : '40px'};
  border-radius: ${props => props.$selectedVessel && !props.$rightMenuIsOpen ? '1px' : '2px'};
  right: ${props => props.$selectedVessel && !props.$rightMenuIsOpen ? '0' : '10px'};
  background: ${props => props.$isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  transition: all 0.3s;
  
  :hover, :focus {
      background: ${props => props.$isOpen ? COLORS.shadowBlue : COLORS.charcoal};
  }
`

const LabelIcon = styled(LabelSVG)`
  width: 40px;
  opacity: ${props => props.$selectedVessel && !props.$rightMenuIsOpen ? '0' : '1'};
  transition: all 0.2s;
`

export default VesselLabels
