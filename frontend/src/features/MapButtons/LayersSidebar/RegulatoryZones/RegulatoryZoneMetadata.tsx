import React, { useCallback } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { ReactComponent as REGPaperSVG } from '../../../icons/reg_paper_dark.svg'
import { FingerprintSpinner } from 'react-epic-spinners'
import { closeRegulatoryZoneMetadata } from '../../../../domain/use_cases/layer/regulation/closeRegulatoryZoneMetadata'
import { useDispatch, useSelector } from 'react-redux'
import { CloseIcon } from '../../../commonStyles/icons/CloseIcon.style'
import { getTitle } from '../../../../domain/entities/regulation'
import IdentificationDisplayed from './metadata/identification/IdentificationDisplayed'
import { FishingPeriodDisplayed } from './metadata/fishingPeriod'
import GearRegulationDisplayed from './metadata/gearRegulation/GearRegulationDisplayed'
import RegulatoryReferencesDisplayed from './metadata/regulatoryReferences/RegulatoryReferencesDisplayed'
import { OutdatedRegulatoryReferences } from './metadata/OutdatedRegulatoryReferences'
import SpeciesRegulationDisplayed from './metadata/speciesRegulation/SpeciesRegulationDisplayed'
import OtherInfoDisplayed from './metadata/otherInfo/OtherInfoDisplayed'

const RegulatoryZoneMetadata = () => {
  const dispatch = useDispatch()

  const {
    regulatoryZoneMetadata,
    regulatoryZoneMetadataPanelIsOpen
  } = useSelector(state => state.regulatory)

  const { healthcheckTextWarning } = useSelector(state => state.global)

  const onCloseIconClicked = useCallback(() => {
    dispatch(closeRegulatoryZoneMetadata())
  }, [dispatch])

  return (
    <Wrapper
      healthcheckTextWarning={healthcheckTextWarning}
      regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}>
      {
        regulatoryZoneMetadata
          ? <>
            <Header>
              <REGPaperIcon/>
              <RegulatoryZoneName title={getTitle(regulatoryZoneMetadata)}>
                {getTitle(regulatoryZoneMetadata)}
              </RegulatoryZoneName>
              <CloseIcon
                data-cy={'regulatory-layers-metadata-close'}
                onClick={onCloseIconClicked}
              />
            </Header>
            <OutdatedRegulatoryReferences/>
            <Content>
              <IdentificationDisplayed/>
              <FishingPeriodDisplayed/>
              <GearRegulationDisplayed/>
              <SpeciesRegulationDisplayed/>
              <OtherInfoDisplayed/>
              <RegulatoryReferencesDisplayed/>
            </Content>
          </>
          // eslint-disable-next-line react/forbid-component-props
          : <FingerprintSpinner color={COLORS.white} className={'radar'} size={100}/>
      }
    </Wrapper>
  )
}

const Wrapper = styled.div`
  border-radius: 2px;
  width: 400px;
  display: block;
  color: ${COLORS.charcoal};
  opacity: ${props => props.regulatoryZoneMetadataPanelIsOpen ? 1 : 0};
  z-index: -1;
  padding: 0;
  transition: all 0.5s;
`

const RegulatoryZoneName = styled.span`
  flex: 1;
  line-height: initial;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  margin-left: 5px;
  margin-right: 5px;
`

const Header = styled.div`
  color: ${COLORS.gunMetal};
  margin-left: 6px;
  text-align: left;
  height: 40px;
  display: flex;
  font-weight: 500;
  font-size: 15px;
  align-items: center;
  justify-content: center;
`

const Content = styled.div`
  border-radius: 2px;
  color: ${COLORS.lightGray};
  background: ${COLORS.white};
  overflow-y: auto;
  max-height: 72vh;
`

const REGPaperIcon = styled(REGPaperSVG)`
  margin-left: 3px;
  width: 25px;
`

export default RegulatoryZoneMetadata
