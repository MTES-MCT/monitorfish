import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'
import { GreenCircle, RedCircle } from '../../../commonStyles/Circle.style'
import { useSelector } from 'react-redux'
import { Label, List, Section, SectionTitle } from './RegulatoryMetadata.style'
import GearsOrGearCategories from './GearsOrGearCategories'
import { COLORS } from '../../../../constants/constants'
import InfoPoint from '../../../backoffice/create_regulation/InfoPoint'
import { getGroupCategories, REGULATORY_GEAR_KEYS } from '../../../../domain/entities/backoffice'
import { INFO_TEXT } from '../../../backoffice/constants'

const MetadataGears = () => {
  const { regulatoryGears } = useSelector(state => state.regulatory.regulatoryZoneMetadata)
  const {
    groupsToCategories,
    categoriesToGears
  } = useSelector(state => state.gear)
  const {
    authorized,
    regulatedGears,
    regulatedGearCategories,
    derogation,
    otherInfo,
    allGears,
    allTowedGears,
    allPassiveGears
  } = regulatoryGears

  const [filteredRegulatedGearCategories, setFilteredRegulatedGearCategories] = useState(regulatedGearCategories)
  const towedGearsCategories = getGroupCategories(REGULATORY_GEAR_KEYS.ALL_TOWED_GEARS, groupsToCategories)
  const passiveGearsCategories = getGroupCategories(REGULATORY_GEAR_KEYS.ALL_PASSIVE_GEARS, groupsToCategories)

  useEffect(() => {
    const nextFilteredRegulatedGearCategories = { ...regulatedGearCategories }
    if (allTowedGears) {
      towedGearsCategories.forEach(category => {
        delete nextFilteredRegulatedGearCategories[category]
      })
    }

    if (allPassiveGears) {
      passiveGearsCategories.forEach(category => {
        delete nextFilteredRegulatedGearCategories[category]
      })
    }

    setFilteredRegulatedGearCategories(nextFilteredRegulatedGearCategories)
  }, [groupsToCategories, allTowedGears, allPassiveGears, regulatedGearCategories])

  return <>{regulatoryGears && authorized !== undefined &&
    <Section data-cy={'regulatory-layers-metadata-gears'}>
      <SectionTitle>{regulatoryGears.authorized
        ? <GreenCircle margin={'0 5px 0 0'} />
        : <RedCircle margin={'0 5px 0 0'} />}
        Engins {regulatoryGears.authorized ? 'réglementés' : 'interdits'}
      </SectionTitle>
      {allGears
        ? <Label>{'Tous les engins'}</Label>
        : <List>
          {
            allTowedGears && <Label
              title={INFO_TEXT.TOWED_GEAR}
              data-cy={'regulatory-layers-metadata-gears-towed-gears'}
            >
              Tous les engins trainants
              <InfoPoint
                title={INFO_TEXT.TOWED_GEAR}
                margin={'3px'}
              />
            </Label>
          }
          {
            allPassiveGears && <Label
              title={INFO_TEXT.PASSIVE_GEAR}
            >
              Tous les engins dormants
              <InfoPoint
                title={INFO_TEXT.PASSIVE_GEAR}
                margin={'3px'}
              />
            </Label>
          }
          <GearsOrGearCategories
            list={regulatedGears}
          />
          <GearsOrGearCategories
            isCategory
            categoriesToGears={categoriesToGears}
            list={filteredRegulatedGearCategories}
          />
        </List>}
      {!authorized && derogation &&
        <Derogation>
          <InfoPoint
            margin={'3px 0 0 0'}
            backgroundColor={COLORS.yellowMunsell}
            color={COLORS.charcoal}
          />
          <DerogationMessage>
            {'Mesures dérogatoire: consulter les références réglementaires'}
          </DerogationMessage>
        </Derogation>
      }
      {
        otherInfo &&
        <ReactMarkdown>
          {otherInfo}
        </ReactMarkdown>
      }
    </Section>}
  </>
}

const Derogation = styled.span`
  display: flex;
  border: 1px solid ${COLORS.yellowMunsell};
  padding: 4px 15px 6px 8px;
`

const DerogationMessage = styled.span`
  color: ${COLORS.slateGray};
  margin-left: 4px;
`

export default MetadataGears
