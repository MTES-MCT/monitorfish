import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'
import { GreenCircle, RedCircle } from '../../../../../commonStyles/Circle.style'
import { Label, List, SectionTitle } from '../RegulatoryMetadata.style'
import { GearsOrGearCategories } from './GearsOrGearCategories'
import { COLORS } from '../../../../../../constants/constants'
import { InfoPoint } from '../../../../../Backoffice/edit_regulation/InfoPoint'
import { getGroupCategories, REGULATED_GEARS_KEYS } from '../../../../../../domain/entities/backoffice'
import { INFO_TEXT } from '../../../../../Backoffice/constants'
import { theme } from '../../../../../../ui/theme'
import { useMainAppSelector } from '../../../../../../hooks/useMainAppSelector'
import type { RegulatedGears } from '../../../../../../domain/types/regulation'

export type RegulatedGearsProps = {
  authorized: boolean
  regulatedGearsObject: RegulatedGears
  hasPreviousRegulatedGearsBloc?: boolean
}
export function RegulatedGears({
  authorized,
  regulatedGearsObject,
  hasPreviousRegulatedGearsBloc = false
}: RegulatedGearsProps) {
  const { groupsToCategories, categoriesToGears } = useMainAppSelector(state => state.gear)

  const { regulatedGears, regulatedGearCategories, derogation, otherInfo, allGears, allTowedGears, allPassiveGears } =
    regulatedGearsObject

  const [filteredRegulatedGearCategories, setFilteredRegulatedGearCategories] = useState(regulatedGearCategories)
  const towedGearsCategories = getGroupCategories(REGULATED_GEARS_KEYS.ALL_TOWED_GEARS, groupsToCategories)
  const passiveGearsCategories = getGroupCategories(REGULATED_GEARS_KEYS.ALL_PASSIVE_GEARS, groupsToCategories)

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

  const dataCyTarget = authorized ? 'authorized' : 'unauthorized'

  return (
    <div data-cy={`${dataCyTarget}-regulatory-layers-metadata-gears`}>
      <SectionTitle $hasPreviousRegulatedGearsBloc={hasPreviousRegulatedGearsBloc}>
        {authorized ? <GreenCircle margin={'0 5px 0 0'} /> : <RedCircle margin={'0 5px 0 0'} />}
        Engins {authorized ? 'réglementés' : 'interdits'}
      </SectionTitle>
      {allGears ? (
        <Label>{'Tous les engins'}</Label>
      ) : (
        <List>
          {allTowedGears && (
            <Label
              title={INFO_TEXT.TOWED_GEAR}
              data-cy={`${dataCyTarget}-regulatory-layers-metadata-gears-towed-gears`}
            >
              Tous les engins trainants
              <InfoPoint title={INFO_TEXT.TOWED_GEAR} margin={'3px'} />
            </Label>
          )}
          {allPassiveGears && (
            <Label
              title={INFO_TEXT.PASSIVE_GEAR}
              data-cy={`${dataCyTarget}-regulatory-layers-metadata-gears-passive-gears`}
            >
              Tous les engins dormants
              <InfoPoint title={INFO_TEXT.PASSIVE_GEAR} margin={'3px'} />
            </Label>
          )}
          <GearsOrGearCategories list={regulatedGears} />
          <GearsOrGearCategories
            isCategory
            categoriesToGears={categoriesToGears}
            list={filteredRegulatedGearCategories}
          />
        </List>
      )}
      {!authorized && derogation && (
        <Derogation>
          <InfoPoint margin={'3px 0 0 0'} backgroundColor={theme.color.goldenPoppy} color={COLORS.charcoal} />
          <DerogationMessage>{'Mesures dérogatoire: consulter les références réglementaires'}</DerogationMessage>
        </Derogation>
      )}
      {otherInfo && <ReactMarkdown>{otherInfo}</ReactMarkdown>}
    </div>
  )
}

const Derogation = styled.span`
  display: flex;
  border: 1px solid ${theme.color.goldenPoppy};
  padding: 4px 15px 6px 8px;
`

const DerogationMessage = styled.span`
  color: ${COLORS.slateGray};
  margin-left: 4px;
`
