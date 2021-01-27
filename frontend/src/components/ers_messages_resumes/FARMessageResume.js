import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {COLORS} from "../../constants/constants";
import SpeciesAndWeightChart from "../SpeciesAndWeightChart";

const FARMessageResume = props => {
    const [speciesAndWeightArray, setSpeciesAndWeightArray] = useState({})

    useEffect(() => {
        if(props.messages && props.messages.length) {
            let speciesToWeightObject = {}
            props.messages.forEach(messages => {
                messages.message.catches.forEach(speciesCatch => {
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
            })

            let array = Object.keys(speciesToWeightObject)
                .map(species => speciesToWeightObject[species])
                .sort((a, b) => a.weight < b.weight)
            setSpeciesAndWeightArray(array)
        }
    }, [props.messages])

    return <>
        { props.messages ?
            <Zone>
                <SpeciesAndWeightChart
                    compareWeights={false}
                    speciesAndWeightArray={speciesAndWeightArray}
                />
            </Zone> : null }
    </>
}

const Zone = styled.div`
  margin: 10px;
  background: ${COLORS.background};
`

export default FARMessageResume
