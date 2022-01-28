import React, { useCallback } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { ReactComponent as REGPaperSVG } from '../../icons/reg_paper_dark.svg'
import { ReactComponent as AlertSVG } from '../../icons/Picto_alerte.svg'
import { FingerprintSpinner } from 'react-epic-spinners'
import closeRegulatoryZoneMetadata from '../../../domain/use_cases/closeRegulatoryZoneMetadata'
import { useDispatch, useSelector } from 'react-redux'
import { CloseIcon } from '../../commonStyles/icons/CloseIcon.style'
import { getTitle } from '../../../domain/entities/regulatory'
import Identification from './metadata/Identification'
import MetadataFishingPeriod from './metadata/MetadataFishingPeriod'
import MetadataGears from './metadata/MetadataGears'
import MetadataSpecies from './metadata/MetadataSpecies'
import MetadataRegulatoryReferences from './metadata/MetadataRegulatoryReferences'

const RegulatoryLayerZoneMetadata = () => {
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
          ? <><Header>
              <REGPaperIcon/>
              <RegulatoryZoneName title={getTitle(regulatoryZoneMetadata)}>
                {getTitle(regulatoryZoneMetadata)}
              </RegulatoryZoneName>
              <CloseIcon
                data-cy={'regulatory-layers-metadata-close'}
                onClick={onCloseIconClicked}
              />
            </Header>
            <Warning>
              <WarningIcon/>
              Travail en cours, bien vérifier dans Légipêche la validité de la référence et des infos réglementaires
            </Warning>
            <Content>
              <Identification />
              <MetadataFishingPeriod />
              <MetadataGears />
              <MetadataSpecies />
              <MetadataRegulatoryReferences />
            </Content></>
          // eslint-disable-next-line react/forbid-component-props
          : <FingerprintSpinner color={COLORS.background} className={'radar'} size={100}/>
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
  background: ${COLORS.background};
  overflow-y: auto;
  max-height: 72vh;
`

const Warning = styled.div`
  font-size: 13px;
  color: ${COLORS.gunMetal};
  background: ${COLORS.orange};
  display: flex;
  text-align: left;
  font: normal normal bold 13px/18px Marianne;
  padding: 10px;
`

const WarningIcon = styled(AlertSVG)`
  width: 30px;
  flex: 57px;
  height: 30px;
  margin: 4px 10px 0px 0;
`

const REGPaperIcon = styled(REGPaperSVG)`
  margin-left: 3px;
  width: 25px;
`

export default RegulatoryLayerZoneMetadata
