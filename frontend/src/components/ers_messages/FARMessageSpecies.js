import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import {ReactComponent as ChevronIconSVG} from "../icons/Chevron_simple_gris.svg";
import {ERSSpeciesPresentation, ERSSpeciesPreservationState} from "../../domain/entities/ERS";
import countries from "i18n-iso-countries";
import {ReactComponent as WarningSVG} from '../../components/icons/Point_exclamation_info.svg';

countries.registerLocale(require("i18n-iso-countries/langs/fr.json"));

const FARMessageSpecies = props => {
    const [isOpen, setIsOpen] = useState(false)

    const getSpeciesName = species => {
        if (species.speciesName && species.species) {
            return `${species.speciesName} (${species.species})`
        } else if (species.species) {
            return species.species
        }

        return "Aucun Nom"
    }

    return <>
        {props.species ?
            <Species>
                <Title isLast={props.isLast} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
                    <TitleText title={getSpeciesName(props.species)}>
                        {getSpeciesName(props.species)}
                    </TitleText>
                    <Weight>
                        <InlineKey>Poids total (estimé) </InlineKey>
                        <Kg>{props.species.weight ? props.species.weight : <NoValue>-</NoValue>} kg</Kg>
                    </Weight>
                    <ChevronIcon isOpen={isOpen} name={props.species.species}/>
                </Title>
                <Content isOpen={isOpen} name={props.species.species}
                         length={props.species.properties ? props.species.properties.length : 1}>
                    {
                        props.species.properties && props.species.properties.length > 1 ? <MultipleProperties>
                            <Warning/> Plusieurs zones de pêche et/ou présentations pour cette espèce
                        </MultipleProperties> : null
                    }
                    {
                        props.species.properties && props.species.properties.length ?
                            props.species.properties.map((species, index) => {
                                return <Property key={props.species.species + index}>
                                    <Fields>
                                        <TableBody>
                                            <Field>
                                                <Key>Présentation</Key>
                                                <TrimmedValue
                                                    title={`${ERSSpeciesPresentation[species.presentation]} (${species.presentation})`}>
                                                    {
                                                        species.presentation && ERSSpeciesPresentation[species.presentation] ?
                                                            <>{ERSSpeciesPresentation[species.presentation]} ({species.presentation})</> :
                                                            species.presentation ? species.presentation :
                                                                <NoValue>-</NoValue>
                                                    }
                                                </TrimmedValue>
                                            </Field>
                                            <Field>
                                                <Key>Préservation</Key>
                                                <TrimmedValue
                                                    title={`${ERSSpeciesPreservationState[species.preservationState]} (${species.preservationState})`}>
                                                    {
                                                        species.preservationState && ERSSpeciesPreservationState[species.preservationState] ?
                                                            <>{ERSSpeciesPreservationState[species.preservationState]} ({species.preservationState})</> :
                                                            species.preservationState ? species.preservationState :
                                                                <NoValue>-</NoValue>
                                                    }
                                                </TrimmedValue>
                                            </Field>
                                            <Field>
                                                <Key>Fact. conversion</Key>
                                                <TrimmedValue>{species.conversionFactor ? species.conversionFactor :
                                                    <NoValue>-</NoValue>}</TrimmedValue>
                                            </Field>
                                        </TableBody>
                                    </Fields>
                                    <Fields>
                                        <TableBody>
                                            <Field>
                                                <Key>ZEE</Key>
                                                <Value>
                                                    {species.economicZone ? <>{countries.getName(species.economicZone, 'fr')} ({species.economicZone})</> :
                                                        <NoValue>-</NoValue>}
                                                </Value>
                                            </Field>
                                            <Field>
                                                <Key>Zone FAO</Key>
                                                <Value>{species.faoZone ? <>{species.faoZone}</> :
                                                    <NoValue>-</NoValue>}</Value>
                                            </Field>
                                            <Field>
                                                <Key>Rect. stat.</Key>
                                                <Value>{species.statisticalRectangle ? <>{species.statisticalRectangle}</> :
                                                    <NoValue>-</NoValue>}</Value>
                                            </Field>
                                        </TableBody>
                                    </Fields>
                                </Property>
                            }) : null
                    }
                </Content>
            </Species> : null}
    </>
}

const Warning = styled(WarningSVG)`
  width: 15px;
  margin-bottom: -2px;
  margin-right: 5px;
`

const MultipleProperties = styled.div`
  background: ${COLORS.grayDarker};
  padding: 5px 5px 5px 10px;
  height: 20px;
  width: inherit;
  font-size: 13px;
`

const Property = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const Kg = styled.span`
  width: 60px;
  display: inline-block;
`

const InlineKey = styled.div`
  color: ${COLORS.textGray};
  display: inline-block;
  padding: 0px 5px 0px 10px;
  font-size: 13px;
`

const TitleText = styled.span`
  color: ${COLORS.grayDarkerThree};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;    
  max-width: 220px; 
`

const Weight = styled.span`
  color: ${COLORS.grayDarkerThree};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
  margin-left: auto;
`

const Species = styled.li`
  margin: 0;
  background: ${COLORS.background};
  border-radius: 0;
  padding: 0;
  max-height: 600px;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.textGray};
`

const SpeciesNumber = styled.span`
  color: ${COLORS.textGray};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
  vertical-align: -moz-middle-with-baseline;
`

const Title = styled.div`
  height: 35px;
  width: inherit;
  padding: 0 0 0 20px;
  user-select: none;
  cursor: pointer;
  ${props => props.isLast && !props.isOpen ? '' : `border-bottom: 1px solid ${COLORS.gray};`}
 
  display: flex;
  flex-wrap: wrap;
`

const Content = styled.div`
  width: inherit;
  height: 0;
  overflow: hidden;
  padding: 0;
  border-bottom: 1px solid ${COLORS.gray};
  animation: ${props => props.isOpen ? `list-zones-${props.name}-opening` : `list-zones-${props.name}-closing`} 0.2s ease forwards;

  @keyframes ${props => props.name ? `list-zones-${props.name}-opening` : null} {
    0%   { height: 0; }
    100% { height: ${props => props.length > 1 ? props.length * 82 + 30 : 82}px; }
  }

  @keyframes ${props => props.name ? `list-zones-${props.name}-closing` : null} {
    0%   { height: ${props => props.length > 1 ? props.length * 82 + 30 : 82}px; }
    100% { height: 0; }
  }
`

const ChevronIcon = styled(ChevronIconSVG)`
  transform: rotate(180deg);
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 2px;
  
  animation: ${props => props.isOpen ? `chevron-${props.name}-zones-opening` : `chevron-${props.name}-zones-closing`} 0.2s ease forwards;

  ${props => `
      @keyframes chevron-${props.name}-zones-opening {
        0%   { transform: rotate(180deg); }
        100% { transform: rotate(0deg); }
      }
    
      @keyframes chevron-${props.name}-closing {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(180deg);   }
      }
      `
}
`

const TableBody = styled.tbody``

const Fields = styled.table`
  padding: 10px 5px 5px 20px; 
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
`

const Field = styled.tr`
  margin: 5px 5px 5px 0;
  border: none;
  background: none;
  line-height: 0.5em;
`

const Key = styled.th`
  color: ${COLORS.textGray};
  flex: initial;
  display: inline-block;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  background: none;
  width: max-content;
  line-height: 0.5em;
  height: 0.5em;
  font-size: 13px;
  font-weight: normal;
`

const TrimmedValue = styled.td`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;    
  max-width: 90px; 
`

const Value = styled.td`
  font-size: 13px;
  color: ${COLORS.grayDarkerThree};
  margin: 0;
  text-align: left;
  padding: 1px 5px 5px 5px;
  background: none;
  border: none;
  line-height: normal;
`

const NoValue = styled.span`
  color: ${COLORS.textBueGray};
  font-weight: 300;
  line-height: normal;
  width: 50px;
  display: inline-block;
`


export default FARMessageSpecies
