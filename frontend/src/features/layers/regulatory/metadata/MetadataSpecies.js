
import React from 'react'
import { useSelector } from 'react-redux'
import { SectionTitle, Section, List, Elem, Key, Label, Value, Fields, Field } from './RegulatoryMetadata.style'
import { GreenCircle, RedCircle } from '../../../commonStyles/Circle.style'
import CodeAndName from './CodeAndName'
const MetadataSpecies = () => {
  const { regulatorySpecies } = useSelector(state => state.regulatory.regulatoryZoneMetadata)
  return <>{regulatorySpecies && regulatorySpecies.authorized !== undefined &&
    <Section>
      <SectionTitle>{regulatorySpecies.authorized
        ? <GreenCircle margin={'0 5px 0 0'} />
        : <RedCircle margin={'0 5px 0 0'} />}
        Espèces {regulatorySpecies.authorized ? 'réglementées' : 'interdites'}
      </SectionTitle>
      <List>
        {regulatorySpecies.species.length > 0
          ? regulatorySpecies.species.map((_species) => {
            const { code, name, quantity, minimumSize } = _species
            return (<Elem key={_species}><CodeAndName code={code} name={name} />
                <Fields>
                  {quantity && <Field><Key>Quantité</Key><Value>{quantity}</Value></Field>}
                  {minimumSize && <Field><Key>Taille min.</Key><Value>{minimumSize}</Value></Field>}
                </Fields>
              </Elem>)
          })
          : null
        }
        {regulatorySpecies.speciesGroups.length > 0
          ? regulatorySpecies.speciesGroups.map(group => {
            return (<Elem key={group}><Label>{group}</Label></Elem>)
          })
          : null
        }
      </List>
      {regulatorySpecies.otherInfo &&
        <><SectionTitle>Mesures techniques</SectionTitle>
          {regulatorySpecies.otherInfo}
        </>
      }
    </Section>}</>
}

export default MetadataSpecies
