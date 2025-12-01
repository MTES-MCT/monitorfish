import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'

import { GreenCircle, RedCircle } from '../../../../commonStyles/Circle.style'
import { Elem, Label, List, SectionTitle } from '../RegulatoryMetadata.style'

import type { RegulatedSpecies as RegulatedSpeciesType } from '../../../types'

export type RegulatedSpeciesProps = {
  authorized: boolean
  hasMarginTop?: boolean
  regulatedSpecies: RegulatedSpeciesType
}
export function RegulatedSpecies({ authorized, hasMarginTop = false, regulatedSpecies }: RegulatedSpeciesProps) {
  const { allSpecies, species, speciesGroups } = regulatedSpecies

  const dataCyTarget = authorized ? 'authorized' : 'unauthorized'

  return (
    <div data-cy={`${dataCyTarget}-regulatory-layers-metadata-species`}>
      <SectionTitle $hasPreviousRegulatedGearsBloc={hasMarginTop}>
        {authorized ? <GreenCircle $margin="0 5px 0 0" /> : <RedCircle $margin="0 5px 0 0" />}
        Espèces {authorized ? 'réglementées' : 'interdites'}
      </SectionTitle>
      {allSpecies ? (
        <Label>Toutes les espèces</Label>
      ) : (
        <List>
          {species.length > 0
            ? species.map(specy => {
                const { code, name, remarks } = specy

                return (
                  <Elem key={code}>
                    <Label>
                      {code} ({name})
                    </Label>
                    <Remarks>{remarks}</Remarks>
                  </Elem>
                )
              })
            : null}
          {speciesGroups.length > 0
            ? speciesGroups.map(group => (
                <Elem key={group}>
                  <Label>{group}</Label>
                </Elem>
              ))
            : null}
        </List>
      )}
    </div>
  )
}

const Remarks = styled(ReactMarkdown)`
  margin-left: 24px;
`
