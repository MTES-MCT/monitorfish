import React from 'react'
import { Elem, Field, Fields, Key, Label, List, SectionTitle, Value } from '../RegulatoryMetadata.style'
import { GreenCircle, RedCircle } from '../../../../commonStyles/Circle.style'
import CodeAndName from '../CodeAndName'
import ReactMarkdown from 'react-markdown'

const RegulatedSpecies = ({ authorized, regulatedSpecies, hasPreviousRegulatedSpeciesBloc }) => {
  const {
    allSpecies,
    species,
    speciesGroups
  } = regulatedSpecies

  const dataCyTarget = authorized ? 'authorized' : 'unauthorized'

  return <div data-cy={`${dataCyTarget}-regulatory-layers-metadata-species`}>
    <SectionTitle hasPreviousRegulatedGearsBloc={hasPreviousRegulatedSpeciesBloc}>
      {
        authorized
          ? <GreenCircle margin={'0 5px 0 0'}/>
          : <RedCircle margin={'0 5px 0 0'}/>
      }
      Espèces {authorized ? 'réglementées' : 'interdites'}
    </SectionTitle>
    {allSpecies
      ? <Label>{'Toutes les espèces'}</Label>
      : <List isLast>
        {
          species.length > 0
            ? species.map(_species => {
              const { code, name, remarks } = _species
              return (
                <Elem key={code}>
                  <CodeAndName code={code} name={name}/>
                  <Fields>
                    {remarks &&
                    <Field>
                      <Key>Remarques</Key>
                      <Value>
                        <ReactMarkdown>
                          {remarks}
                        </ReactMarkdown>
                      </Value>
                    </Field>}
                  </Fields>
                </Elem>
              )
            })
            : null
        }
        {
          speciesGroups.length > 0
            ? speciesGroups.map(group => {
              return (<Elem key={group}><Label>{group}</Label></Elem>)
            })
            : null
        }
      </List>
    }
  </div>
}

export default RegulatedSpecies
