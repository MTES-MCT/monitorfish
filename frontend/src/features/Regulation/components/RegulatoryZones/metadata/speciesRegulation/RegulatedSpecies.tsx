import ReactMarkdown from 'react-markdown'

import { GreenCircle, RedCircle } from '../../../../../commonStyles/Circle.style'
import { CodeAndName } from '../CodeAndName'
import { Elem, Field, Fields, Key, Label, List, SectionTitle, Value } from '../RegulatoryMetadata.style'

import type { RegulatedSpecies as RegulatedSpeciesType } from '../../../../types'

export type RegulatedSpeciesProps = {
  authorized: boolean
  hasPreviousRegulatedSpeciesBloc?: boolean
  regulatedSpecies: RegulatedSpeciesType
}
export function RegulatedSpecies({
  authorized,
  hasPreviousRegulatedSpeciesBloc = false,
  regulatedSpecies
}: RegulatedSpeciesProps) {
  const { allSpecies, species, speciesGroups } = regulatedSpecies

  const dataCyTarget = authorized ? 'authorized' : 'unauthorized'

  return (
    <div data-cy={`${dataCyTarget}-regulatory-layers-metadata-species`}>
      <SectionTitle $hasPreviousRegulatedGearsBloc={hasPreviousRegulatedSpeciesBloc}>
        {authorized ? <GreenCircle margin="0 5px 0 0" /> : <RedCircle margin="0 5px 0 0" />}
        Espèces {authorized ? 'réglementées' : 'interdites'}
      </SectionTitle>
      {allSpecies ? (
        <Label>Toutes les espèces</Label>
      ) : (
        <List $isLast>
          {species.length > 0
            ? species.map(specy => {
                const { code, name, remarks } = specy

                return (
                  <Elem key={code}>
                    <CodeAndName code={code} name={name} />
                    <Fields>
                      <tbody>
                        {remarks && (
                          <Field>
                            <Key>Remarques</Key>
                            <Value>
                              <ReactMarkdown>{remarks}</ReactMarkdown>
                            </Value>
                          </Field>
                        )}
                      </tbody>
                    </Fields>
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
