import { RegulatoryTagsLabel } from '@features/Regulation/components/RegulatoryZoneMetadata/constants'
import { GearRegulation } from '@features/Regulation/components/RegulatoryZoneMetadata/GearRegulation'
import { SpeciesRegulation } from '@features/Regulation/components/RegulatoryZoneMetadata/SpeciesRegulation'
import { ZonePreview } from '@features/Regulation/components/ZonePreview'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { useMainAppSelector } from '@hooks/useMainAppSelector'
import { useTracking } from '@hooks/useTracking'
import { FingerprintLoader, Icon, Tag, THEME } from '@mtes-mct/monitor-ui'
import { useEffect } from 'react'
import styled from 'styled-components'

import { FishingPeriod } from './FishingPeriod'
import { Identification } from './Identification'
import { OtherInfo } from './OtherInfo'
import { OutdatedRegulatoryReferences } from './OutdatedRegulatoryReferences'
import { RegulatoryReferences } from './RegulatoryReferences'
import { closeRegulatoryZoneMetadata } from '../../useCases/closeRegulatoryZoneMetadata'
import { getTitle } from '../../utils'

export function RegulatoryZoneMetadata() {
  const dispatch = useMainAppDispatch()
  const { trackPage } = useTracking()

  const regulatoryZoneMetadata = useMainAppSelector(state => state.regulation.regulatoryZoneMetadata)
  const regulatoryZoneMetadataPanelIsOpen = useMainAppSelector(
    state => state.regulation.regulatoryZoneMetadataPanelIsOpen
  )

  const onCloseIconClicked = () => {
    dispatch(closeRegulatoryZoneMetadata())
  }

  useEffect(() => {
    if (regulatoryZoneMetadataPanelIsOpen) {
      trackPage(`/regulation_metadata/${regulatoryZoneMetadata?.topic}/${regulatoryZoneMetadata?.zone}`)
    }
  }, [trackPage, regulatoryZoneMetadataPanelIsOpen, regulatoryZoneMetadata])

  return (
    <Wrapper $regulatoryZoneMetadataPanelIsOpen={!!regulatoryZoneMetadataPanelIsOpen}>
      {regulatoryZoneMetadata ? (
        <>
          <Header>
            <StyledZonePreview regulatoryZone={regulatoryZoneMetadata} />
            <NameAndTagsContainer>
              <RegulatoryZoneName title={getTitle(regulatoryZoneMetadata)}>
                {getTitle(regulatoryZoneMetadata)}
              </RegulatoryZoneName>
              <TagsContainer>
                {regulatoryZoneMetadata?.tags?.map(tag => (
                  <StyledTag backgroundColor={THEME.color.white} title={RegulatoryTagsLabel[tag]}>
                    {tag}
                  </StyledTag>
                ))}
              </TagsContainer>
            </NameAndTagsContainer>
            <StyledCloseIcon
              color={THEME.color.slateGray}
              data-cy="regulatory-layers-metadata-close"
              onClick={onCloseIconClicked}
              size={14}
            />
          </Header>
          <OutdatedRegulatoryReferences />
          <Content>
            <Identification />
            <FishingPeriod />
            <GearRegulation />
            <SpeciesRegulation />
            <OtherInfo />
            <RegulatoryReferences />
          </Content>
        </>
      ) : (
        <FingerprintLoader className="radar" />
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
const NameAndTagsContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const RegulatoryZoneName = styled.span`
  line-height: initial;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
  margin-right: 5px;
`

const TagsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-right: 4px;
`
const StyledTag = styled(Tag)`
  align-self: center;
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
  border: 1px solid ${THEME.color.gainsboro};
`
