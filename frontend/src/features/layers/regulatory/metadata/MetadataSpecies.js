
import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { SectionTitle, Section, List, Elem, Key, Label, Value } from './RegulatoryMetadata.style'
import { GreenCircle, RedCircle } from '../../../commonStyles/Circle.style'
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
          ? regulatorySpecies.species.map((specie) => {
            const { code, name, quantity, minimumSize } = specie
            return (<Elem key={specie}><Label>{`${code} (${name})`}</Label>
                {quantity && <Desc><Key>Quantité</Key><Value>{quantity}</Value></Desc>}
                {minimumSize && <Desc><Key>Taille min.</Key><Value>{minimumSize}</Value></Desc>}
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

const Desc = styled.span`
  display: flex;
  flex-direction: row;
`

export default MetadataSpecies
