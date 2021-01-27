import React from "react";
import styled from "styled-components";
import {COLORS} from "../constants/constants";

const SpeciesAndWeightChart = props => {
    return <>
        {
            props.speciesAndWeightArray && props.speciesAndWeightArray.length ? props.speciesAndWeightArray.map((speciesAndWeight, index) => {
                return <SpeciesAndWeight key={speciesAndWeight.species} weight={speciesAndWeight.weight}>
                    <Weight
                        weight={speciesAndWeight.weight}
                        isLast={index === props.speciesAndWeightArray.length - 1}
                        compareWeights={props.compareWeights}
                        weightAreEquals={speciesAndWeight.farWeight ? speciesAndWeight.farWeight === speciesAndWeight.weight : false}
                    >

                        <WeightText>{speciesAndWeight.weight}{speciesAndWeight.farWeight ? `/${speciesAndWeight.farWeight}` : null} kg</WeightText>
                    </Weight>
                    <Species
                        weight={speciesAndWeight.weight}
                        isLast={index === props.speciesAndWeightArray.length - 1}
                        compareWeights={props.compareWeights}
                        weightAreEquals={speciesAndWeight.farWeight ? speciesAndWeight.farWeight === speciesAndWeight.weight : false}
                    >
                        {
                            speciesAndWeight.speciesName ?
                                <>{speciesAndWeight.speciesName} ({speciesAndWeight.species})</> : speciesAndWeight.species
                        }
                    </Species>
                </SpeciesAndWeight>
            }) : null
        }
    </>
}

const SpeciesAndWeight = styled.div`
  display: flex;
  width: 100%;
  margin-left: 5px;
`

const Species = styled.div`
  display: flex;
  height: ${props => props.weight ? props.weight * 0.04 : 20}px;
  font-weight: ${props => props.compareWeights ? props.weightAreEquals ? 'normal' : '500' : 'normal'};
  min-height: 20px;
  align-items: center;
  justify-content: center;
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  margin: 2px 0 0 10px;
  ${props => props.isLast ? `margin-bottom: 2px ;` : ''}
`

const WeightText = styled.span``

const Weight = styled.div`
  width: 75px;
  background: ${props => props.compareWeights ? props.weightAreEquals ? COLORS.grayBackground : COLORS.grayDarker : COLORS.grayBackground} 0% 0% no-repeat padding-box;
  font-weight: ${props => props.compareWeights ? props.weightAreEquals ? 'normal' : '500' : 'normal'};
  border-left: 2px solid ${COLORS.textGray};
  border-right: 2px solid ${COLORS.textGray};
  border-top: 2px solid ${COLORS.textGray};
  ${props => props.isLast ? `border-bottom: 2px solid ${COLORS.textGray};` : ''}
  height: ${props => props.weight ? props.weight * 0.04 : 20}px;
  min-height: 20px;
  max-height: 90px;
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Zone = styled.div`
  margin: 10px;
  background: ${COLORS.background};
`

export default SpeciesAndWeightChart
