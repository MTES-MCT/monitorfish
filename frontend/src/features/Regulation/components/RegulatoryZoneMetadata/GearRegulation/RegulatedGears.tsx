import { Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { theme } from '../../../../../ui/theme'
import { GreenCircle, RedCircle } from '../../../../commonStyles/Circle.style'
import { InfoPoint } from '../../RegulationForm/InfoPoint'
import { INFO_TEXT } from '../../RegulationTables/constants'
import { Label, List, SectionTitle } from '../RegulatoryMetadata.style'
import { CategoriesList } from './CategoriesList'

import type { RegulatedGears as RegulatedGearsType } from '../../../types'

export type RegulatedGearsProps = {
  authorized: boolean
  hasMarginTop?: boolean
  regulatedGearsObject: RegulatedGearsType
}
export function RegulatedGears({ authorized, hasMarginTop = false, regulatedGearsObject }: RegulatedGearsProps) {
  const { allGears, allPassiveGears, allTowedGears, derogation, regulatedGearCategories, regulatedGears } =
    regulatedGearsObject

  const dataCyTarget = authorized ? 'authorized' : 'unauthorized'

  return (
    <Wrapper data-cy={`${dataCyTarget}-regulatory-layers-metadata-gears`}>
      <SectionTitle $hasPreviousRegulatedGearsBloc={hasMarginTop}>
        {authorized ? <GreenCircle $margin="0 5px 0 0" /> : <RedCircle $margin="0 5px 0 0" />}
        Engins {authorized ? 'réglementés' : 'interdits'}
      </SectionTitle>
      {allGears && <Label>Tous les engins</Label>}
      {!allGears && (
        <List>
          {allTowedGears && (
            <Label
              data-cy={`${dataCyTarget}-regulatory-layers-metadata-gears-towed-gears`}
              title={INFO_TEXT.TOWED_GEAR}
            >
              Tous les engins trainants
              <StyledInfoPoint size={16} title={INFO_TEXT.TOWED_GEAR} />
            </Label>
          )}
          {allPassiveGears && (
            <Label
              data-cy={`${dataCyTarget}-regulatory-layers-metadata-gears-passive-gears`}
              title={INFO_TEXT.PASSIVE_GEAR}
            >
              Tous les engins dormants
              <StyledInfoPoint size={16} title={INFO_TEXT.PASSIVE_GEAR} />
            </Label>
          )}
          <CategoriesList
            allPassiveGears={!!allPassiveGears}
            allTowedGears={!!allTowedGears}
            regulatedGearCategories={regulatedGearCategories}
            regulatedGears={regulatedGears}
          />
        </List>
      )}
      {!authorized && derogation && (
        <Derogation>
          <InfoPoint backgroundColor={theme.color.goldenPoppy} color={THEME.color.charcoal} margin="3px 0 0 0" />
          <DerogationMessage>Mesures dérogatoire: consulter les références réglementaires</DerogationMessage>
        </Derogation>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div``

const Derogation = styled.span`
  display: flex;
  border: 1px solid ${theme.color.goldenPoppy};
  padding: 4px 15px 6px 8px;
`

const StyledInfoPoint = styled(Icon.Info)`
  margin-left: 3px;
  cursor: help;
`

const DerogationMessage = styled.span`
  color: ${p => p.theme.color.slateGray};
  margin-left: 4px;
`
