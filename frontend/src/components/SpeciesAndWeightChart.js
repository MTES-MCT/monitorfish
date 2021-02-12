import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../constants/constants";

const SpeciesAndWeightChart = props => {
    const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState([])

    useEffect(() => {
        if(props.speciesAndWeightArray && props.increaseChartHeight) {
            let speciesAndWeightArray = props.speciesAndWeightArray.map((speciesAndWeight) => {
                let height = speciesAndWeight.weight ? speciesAndWeight.weight * 0.04 : 20

                speciesAndWeight.height = height >= 22 ? height : 22
                return speciesAndWeight
            })

            setSpeciesAndWeightArray(speciesAndWeightArray)
            let totalHeight = speciesAndWeightArray.reduce((subAccumulator, speciesCatch) => {
                return subAccumulator + speciesCatch.height
            }, 0)
            props.increaseChartHeight(totalHeight)
        }
    }, [props.speciesAndWeightArray])

    const getPercentOfTotalFARWeight = speciesAndWeight => {
        return ((speciesAndWeight.weight * 100) / speciesAndWeight.totalWeight).toFixed(1)
    }

    return <>
        {
            speciesAndWeightArray && speciesAndWeightArray.length ? props.speciesAndWeightArray.map((speciesAndWeight, index) => {
                return <SpeciesAndWeight key={speciesAndWeight.species}>
                    <Weight
                        height={speciesAndWeight.height}
                        isLast={index === props.speciesAndWeightArray.length - 1}
                    >
                        <WeightText>{speciesAndWeight.weight} kg {props.compareWithTotalWeight ? <Gray>({getPercentOfTotalFARWeight(speciesAndWeight)} %)</Gray> : null}</WeightText>
                    </Weight>
                    <Species
                        height={speciesAndWeight.height}
                        isLast={index === speciesAndWeightArray.length - 1}
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

const Gray = styled.span`
  color: ${COLORS.grayDarkerThree};
  font-weight: 300;
`

const SpeciesAndWeight = styled.div`
  display: flex;
  width: 100%;
  margin-left: 5px;
`

const Species = styled.div`
  display: flex;
  height: ${props => props.height}px;
  min-height: 20px;
  max-height: 90px;
  align-items: center;
  justify-content: center;
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  margin: 2px 0 0 10px;
  ${props => props.isLast ? `margin-bottom: 2px ;` : ''}
`

const WeightText = styled.span``

const Weight = styled.div`
  width: 110px;
  background: ${COLORS.grayBackground} 0% 0% no-repeat padding-box;
  font-weight: normal;
  border-left: 2px solid ${COLORS.textGray};
  border-right: 2px solid ${COLORS.textGray};
  border-top: 2px solid ${COLORS.textGray};
  ${props => props.isLast ? `border-bottom: 2px solid ${COLORS.textGray};` : ''}
  height: ${props => props.height}px;
  min-height: 20px;
  max-height: 90px;
  color: ${COLORS.grayDarkerThree};
  font-size: 13px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`

export default SpeciesAndWeightChart
