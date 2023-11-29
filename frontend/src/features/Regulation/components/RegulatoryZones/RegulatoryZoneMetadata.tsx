import { useCallback } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { FishingPeriodDisplayed } from './metadata/fishingPeriod'
import { GearRegulationDisplayed } from './metadata/gearRegulation/GearRegulationDisplayed'
import { IdentificationDisplayed } from './metadata/identification/IdentificationDisplayed'
import { OtherInfoDisplayed } from './metadata/otherInfo/OtherInfoDisplayed'
import { OutdatedRegulatoryReferences } from './metadata/OutdatedRegulatoryReferences'
import { RegulatoryReferencesDisplayed } from './metadata/regulatoryReferences/RegulatoryReferencesDisplayed'
import { SpeciesRegulationDisplayed } from './metadata/speciesRegulation/SpeciesRegulationDisplayed'
import { COLORS } from '../../../../constants/constants'
import { useMainAppDispatch } from '../../../../hooks/useMainAppDispatch'
import { useMainAppSelector } from '../../../../hooks/useMainAppSelector'
import { CloseIcon } from '../../../commonStyles/icons/CloseIcon.style'
import REGPaperSVG from '../../../icons/reg_paper_dark.svg?react'
import { closeRegulatoryZoneMetadata } from '../../useCases/closeRegulatoryZoneMetadata'
import { getTitle } from '../../utils'

export function RegulatoryZoneMetadata() {
  const dispatch = useMainAppDispatch()

  const { regulatoryZoneMetadata, regulatoryZoneMetadataPanelIsOpen } = useMainAppSelector(state => state.regulatory)

  const onCloseIconClicked = useCallback(() => {
    dispatch(closeRegulatoryZoneMetadata())
  }, [dispatch])

  return (
    <Wrapper $regulatoryZoneMetadataPanelIsOpen={regulatoryZoneMetadataPanelIsOpen}>
      {regulatoryZoneMetadata ? (
        <>
          <Header>
            <REGPaperIcon />
            <RegulatoryZoneName title={getTitle(regulatoryZoneMetadata)}>
              {getTitle(regulatoryZoneMetadata)}
            </RegulatoryZoneName>
            <CloseIcon data-cy="regulatory-layers-metadata-close" onClick={onCloseIconClicked} />
          </Header>
          <OutdatedRegulatoryReferences />
          <Content>
            <IdentificationDisplayed />
            <FishingPeriodDisplayed />
            <GearRegulationDisplayed />
            <SpeciesRegulationDisplayed />
            <OtherInfoDisplayed />
            <RegulatoryReferencesDisplayed />
          </Content>
        </>
      ) : (
        // eslint-disable-next-line react/forbid-component-props
        <FingerprintSpinner className="radar" color={COLORS.white} size={100} />
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{
  $regulatoryZoneMetadataPanelIsOpen: boolean
}>`
  border-radius: 2px;
  width: 400px;
  display: block;
  color: ${COLORS.charcoal};
  opacity: ${p => (p.$regulatoryZoneMetadataPanelIsOpen ? 1 : 0)};
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
