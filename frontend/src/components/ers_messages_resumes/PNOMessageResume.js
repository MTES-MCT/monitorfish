import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import {getDateTime} from "../../utils";
import {ERSMessagePNOPurposeType} from "../../domain/entities/ERS";
import SpeciesAndWeightChart from "../SpeciesAndWeightChart";

const PNOMessageResume = props => {
    const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState({})

    useEffect(() => {
        if(props.ersMessage && props.farMessages && props.ersMessage.message) {
            let speciesToWeightFARObject = {}
            props.farMessages.forEach(messages => {
                messages.message.catches.forEach(speciesCatch => {
                    if (speciesToWeightFARObject[speciesCatch.species]) {
                        speciesToWeightFARObject[speciesCatch.species].weight += speciesCatch.weight
                    } else {
                        speciesToWeightFARObject[speciesCatch.species] = {
                            species: speciesCatch.species,
                            weight: speciesCatch.weight,
                            speciesName: speciesCatch.speciesName
                        }
                    }
                })
            })

            let speciesToWeightObject = {}
            props.ersMessage.message.catchOnboard.forEach(speciesCatch => {
                if (speciesToWeightObject[speciesCatch.species]) {
                    speciesToWeightObject[speciesCatch.species].weight += speciesCatch.weight
                } else {
                    speciesToWeightObject[speciesCatch.species] = {
                        species: speciesCatch.species,
                        weight: speciesCatch.weight,
                        speciesName: speciesCatch.speciesName
                    }
                }
            })

            let array = Object.keys(speciesToWeightObject)
                .map(species => {
                    if(speciesToWeightFARObject[species]) {
                        speciesToWeightObject[species].farWeight = speciesToWeightFARObject[species].weight
                    }

                    return speciesToWeightObject[species]
                })
                .sort((a, b) => a.weight < b.weight)
            setSpeciesAndWeightArray(array)
        }
    }, [props.ersMessage, props.farMessages])

    return <>
        { props.ersMessage ?
            <Zone>
                <Fields>
                    <TableBody>
                        <Field>
                            <Key>Date d'émission</Key>
                            <Value>{props.ersMessage.operationDateTime ? <>Le {getDateTime(props.ersMessage.operationDateTime, true)} <Gray>(UTC)</Gray></> : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Date prévue d'arrivée</Key>
                            <Value>{props.ersMessage.message.predictedArrivalDatetimeUtc ? <>Le {getDateTime(props.ersMessage.message.predictedArrivalDatetimeUtc, true)} <Gray>(UTC)</Gray></> : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Port d'arrivée</Key>
                            <Value>{props.ersMessage.message.port && props.ersMessage.message.portName ? <>{props.ersMessage.message.portName} ({props.ersMessage.message.port})</> : <NoValue>-</NoValue>}</Value>
                        </Field>
                        <Field>
                            <Key>Raison du préavis</Key>
                            <Value>{props.ersMessage.message.purpose ? <>{ERSMessagePNOPurposeType[props.ersMessage.message.purpose]} ({props.ersMessage.message.purpose})</> : <NoValue>-</NoValue>}</Value>
                        </Field>
                    </TableBody>
                </Fields>
                <SpeciesAndWeightChart
                    compareWeights={true}
                    speciesAndWeightArray={speciesAndWeightArray}
                />
            </Zone> : null }
    </>
}

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

const TableBody = styled.tbody``

const Zone = styled.div`
  margin: 10px;
  text-align: left;
  background: ${COLORS.background};
`

const Fields = styled.table`
  padding: 5px 5px 5px 5px; 
  width: inherit;
  display: table;
  margin: 0;
  min-width: 40%;
  line-height: 0.2em;
  margin-top: 5px;
  margin-bottom: 5px;
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
`

export default PNOMessageResume
