import { ZonePreview } from '@features/Regulation/components/ZonePreview'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import { useCallback } from 'react'
import { FingerprintSpinner } from 'react-epic-spinners'
import styled from 'styled-components'

import { FishingPeriodDisplayed } from './fishingPeriod'
import { GearRegulationDisplayed } from './gearRegulation/GearRegulationDisplayed'
import { IdentificationDisplayed } from './identification/IdentificationDisplayed'
import { OtherInfoDisplayed } from './otherInfo/OtherInfoDisplayed'
import { OutdatedRegulatoryReferences } from './OutdatedRegulatoryReferences'
import { RegulatoryReferencesDisplayed } from './regulatoryReferences/RegulatoryReferencesDisplayed'
import { SpeciesRegulationDisplayed } from './speciesRegulation/SpeciesRegulationDisplayed'
import { closeRegulatoryZoneMetadata } from '../../useCases/closeRegulatoryZoneMetadata'
import { getTitle } from '../../utils'

export function RegulatoryZoneMetadata() {
  const dispatch = useMainAppDispatch()

  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulatory.regulatoryZoneMetadata)
  const regulatoryZoneMetadataPanelIsOpen = useMainAppSelector(state => state.regulatory.regulatoryZoneMetadata)

  const onCloseIconClicked = useCallback(() => {
    dispatch(closeRegulatoryZoneMetadata())
  }, [dispatch])

  return (
    <Wrapper $regulatoryZoneMetadataPanelIsOpen={!!regulatoryZoneMetadataPanelIsOpen}>
      {regulatoryZoneMetadata ? (
        <>
          <Header>
            <StyledZonePreview regulatoryZone={regulatoryZoneMetadata} />
            <RegulatoryZoneName title={getTitle(regulatoryZoneMetadata)}>
              {getTitle(regulatoryZoneMetadata)}
            </RegulatoryZoneName>
            <StyledCloseIcon
              color={THEME.color.slateGray}
              data-cy="regulatory-layers-metadata-close"
              onClick={onCloseIconClicked}
              size={14}
            />
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
        <FingerprintSpinner className="radar" color={THEME.color.white} size={100} />
      )}
    </Wrapper>
  )
}

const StyledZonePreview = styled(ZonePreview)`
  margin-left: 8px;
`

const StyledCloseIcon = styled(Icon.Close)`
  margin-right: 16px;
  cursor: pointer;
`

const Wrapper = styled.div<{
  $regulatoryZoneMetadataPanelIsOpen: boolean
}>`
  border-radius: 2px;
  width: 400px;
  display: block;
  color: ${THEME.color.charcoal};
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
  margin-right: 5px;
`

const Header = styled.div`
  color: ${THEME.color.gunMetal};
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
  color: ${THEME.color.lightGray};
  background: ${THEME.color.white};
  overflow-y: auto;
  max-height: 72vh;
`
