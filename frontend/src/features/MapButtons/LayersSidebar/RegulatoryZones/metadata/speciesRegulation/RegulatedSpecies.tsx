import { Elem, Field, Fields, Key, Label, List, SectionTitle, Value } from '../RegulatoryMetadata.style'
import { GreenCircle, RedCircle } from '../../../../../commonStyles/Circle.style'
import { CodeAndName } from '../CodeAndName'
import ReactMarkdown from 'react-markdown'
import type { RegulatedSpecies } from '../../../../../../domain/types/regulation'

export type RegulatedSpeciesProps = {
  authorized: boolean
  regulatedSpecies: RegulatedSpecies
  hasPreviousRegulatedSpeciesBloc?: boolean
}
export function RegulatedSpecies({
  authorized,
  regulatedSpecies,
  hasPreviousRegulatedSpeciesBloc = false
}: RegulatedSpeciesProps) {
  const { allSpecies, species, speciesGroups } = regulatedSpecies

  const dataCyTarget = authorized ? 'authorized' : 'unauthorized'

  return (
    <div data-cy={`${dataCyTarget}-regulatory-layers-metadata-species`}>
      <SectionTitle $hasPreviousRegulatedGearsBloc={hasPreviousRegulatedSpeciesBloc}>
        {authorized ? <GreenCircle margin={'0 5px 0 0'} /> : <RedCircle margin={'0 5px 0 0'} />}
        Espèces {authorized ? 'réglementées' : 'interdites'}
      </SectionTitle>
      {allSpecies ? (
        <Label>{'Toutes les espèces'}</Label>
      ) : (
        <List $isLast>
          {species.length > 0
            ? species.map(_species => {
                // TODO Check that, there is no `name` here (or the typings are wrong).
                // const { code, name, remarks } = _species
                const { code, remarks } = _species
                return (
                  <Elem key={code}>
                    <CodeAndName code={code} name={code} />
                    <Fields>
                      {remarks && (
                        <Field>
                          <Key>Remarques</Key>
                          <Value>
                            <ReactMarkdown>{remarks}</ReactMarkdown>
                          </Value>
                        </Field>
                      )}
                    </Fields>
                  </Elem>
                )
              })
            : null}
          {speciesGroups.length > 0
            ? speciesGroups.map(group => {
                return (
                  <Elem key={group}>
                    <Label>{group}</Label>
                  </Elem>
                )
              })
            : null}
        </List>
      )}
    </div>
  )
}
