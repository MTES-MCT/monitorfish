import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { LogbookSpeciesPresentation } from '../../../../domain/entities/logbook'
import { ReactComponent as ChevronIconSVG } from '../../../icons/Chevron_simple_gris.svg'

function getHeight (weight, percentOfTotalFARWeight) {
  let height = weight ? Math.log10(percentOfTotalFARWeight) : 22

  height = height * 50
  height = height <= 22 ? 22 : height
  height = height > 90 ? 90 : height

  return height
}

const SpeciesAndWeightChart = ({
  speciesAndWeightArray,
  speciesPresentationAndWeightArray,
  setChartHeight,
  increaseChartTotalHeight,
  resetInitialChartHeight,
  compareWithTotalWeight
}) => {
  const [speciesAndWeightArrayWithHeight, setSpeciesAndWeightArrayWithHeight] = useState([])
  const [speciesPresentationOpened, setSpeciesPresentationOpened] = useState(null)

  useEffect(() => {
    if (speciesAndWeightArrayWithHeight && setChartHeight) {
      const nextSpeciesAndWeightArrayWithHeight = speciesAndWeightArray.map(speciesAndWeight => {
        speciesAndWeight.height = getHeight(speciesAndWeight.weight, getPercentOfTotalFARWeight(speciesAndWeight))

        return speciesAndWeight
      })

      setSpeciesAndWeightArrayWithHeight(nextSpeciesAndWeightArrayWithHeight)
      const totalHeight = nextSpeciesAndWeightArrayWithHeight.reduce((subAccumulator, speciesCatch) => {
        return subAccumulator + speciesCatch.height + 2
      }, 0)

      setChartHeight(totalHeight)
    }
  }, [speciesAndWeightArray])

  const openPresentation = (species, speciesPresentationAndWeight) => {
    const height = speciesPresentationAndWeight ? speciesPresentationAndWeight.length * 22 + 4 : 0

    if (speciesPresentationOpened === species) {
      setSpeciesPresentationOpened(null)
      resetInitialChartHeight()
    } else {
      setSpeciesPresentationOpened(species)
      increaseChartTotalHeight(height)
    }
  }

  const getPercentOfTotalFARWeight = speciesAndWeight => {
    return parseFloat(((speciesAndWeight.weight * 100) / speciesAndWeight.totalWeight).toFixed(1))
  }

  const getPercentOfPresentationToSpeciesWeight = (presentationWeight, speciesWeight) => {
    return parseFloat(((presentationWeight * 100) / speciesWeight).toFixed(1))
  }

  return <>
    {
      speciesAndWeightArrayWithHeight && speciesAndWeightArrayWithHeight.length
        ? speciesAndWeightArrayWithHeight.map((speciesAndWeight, index) => {
          return <Wrapper key={speciesAndWeight.species}>
            <SpeciesAndWeight>
              <Weight
                hasPresentation={speciesPresentationAndWeightArray}
                height={speciesAndWeight.height}
                isLast={index === speciesAndWeightArrayWithHeight.length - 1 && speciesAndWeight.species !== speciesPresentationOpened}
                onClick={() => speciesPresentationAndWeightArray
                  ? openPresentation(speciesAndWeight.species, speciesPresentationAndWeightArray[index])
                  : undefined
                }
              >
                <WeightText>
                  {parseFloat(speciesAndWeight.weight.toFixed(1))} kg{' '}
                  {
                    compareWithTotalWeight
                      ? <Gray>({getPercentOfTotalFARWeight(speciesAndWeight)} %)</Gray>
                      : null
                  }
                </WeightText>
                {
                  speciesPresentationAndWeightArray
                    ? <ChevronIcon $isOpen={speciesAndWeight.species === speciesPresentationOpened}/>
                    : null
                }
              </Weight>
              <Species
                height={speciesAndWeight.height}
                isLast={index === speciesAndWeightArrayWithHeight.length - 1 && speciesAndWeight.species !== speciesPresentationOpened}
              >
                {
                  speciesAndWeight.speciesName
                    ? <>{speciesAndWeight.speciesName} ({speciesAndWeight.species})</>
                    : speciesAndWeight.species
                }
              </Species>
            </SpeciesAndWeight>
            <PresentationWrapper isOpen={speciesAndWeight.species === speciesPresentationOpened}>
                { speciesPresentationAndWeightArray && speciesPresentationAndWeightArray[index]
                  ? speciesPresentationAndWeightArray[index]
                    .map((speciesAndPresentation, presentationIndex) => {
                      return <SpeciesAndPresentation key={speciesAndPresentation.presentation}>
                        <PresentationWeight isLast={presentationIndex === speciesPresentationAndWeightArray[index].length - 1}>
                          {speciesAndPresentation.weight} kg
                          <Percents>({getPercentOfPresentationToSpeciesWeight(speciesAndPresentation.weight, speciesAndWeight.weight)} %)</Percents>
                        </PresentationWeight>
                        <Presentation>
                          {speciesAndPresentation.presentation
                            ? <>{LogbookSpeciesPresentation[speciesAndPresentation.presentation]} ({speciesAndPresentation.presentation})</>
                            : 'Inconnu'
                          }
                        </Presentation>
                      </SpeciesAndPresentation>
                    })
                  : null
                }
            </PresentationWrapper>
          </Wrapper>
        })
        : null
    }
  </>
}

const Presentation = styled.div`
  height: 20px;
  margin: 2px 0 0 10px;
  font-size: 13px;
  color: ${COLORS.gunMetal};
  font-weight: 300;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 252px;
`

const Wrapper = styled.div``

const Gray = styled.span`
  color: ${COLORS.slateGray};
`

const SpeciesAndWeight = styled.div`
  display: flex;
  width: 100%;
  margin-left: 5px;
`

const SpeciesAndPresentation = styled.div`
  display: flex;
  width: 100%;
  margin-left: 5px;
`

const PresentationWrapper = styled.div`
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  height: ${props => props.isOpen ? 'inherit' : '0px'};
`

const Species = styled.div`
  display: flex;
  height: ${props => props.height}px;
  min-height: 20px;
  max-height: 90px;
  align-items: center;
  color: ${COLORS.gunMetal};
  font-size: 13px;
  margin: 2px 0 0 10px;
  ${props => props.isLast ? 'margin-bottom: 2px ;' : ''}
  font-weight: 500;
  max-width: 260px;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const WeightText = styled.span``

const Weight = styled.div`
  width: 130px;
  background: ${COLORS.gainsboro} 0% 0% no-repeat padding-box;
  font-weight: 500;
  border-left: 2px solid ${COLORS.slateGray};
  border-right: 2px solid ${COLORS.slateGray};
  border-top: 2px solid ${COLORS.slateGray};
  ${props => props.isLast ? `border-bottom: 2px solid ${COLORS.slateGray};` : ''}
  height: ${props => props.height}px;
  min-height: 20px;
  max-height: 90px;
  color: ${COLORS.gunMetal};
  font-size: 11px;
  display: flex;
  align-items: center;
  text-align: left;
  padding-left: 10px;
  ${props => props.hasPresentation ? 'cursor: pointer;' : null}
`

const PresentationWeight = styled.div`
  width: 130px;
  font-weight: normal;
  border-left: 2px solid ${COLORS.slateGray};
  border-right: 2px solid ${COLORS.slateGray};
  border-top: 2px solid ${COLORS.slateGray};
  ${props => props.isLast ? `border-bottom: 2px solid ${COLORS.slateGray};` : ''}
  ${props => props.isLast ? 'margin-bottom: 4px;' : ''}
  height: 20px;
  font-size: 11px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  color: ${COLORS.gunMetal};
  font-weight: 300;
`

const Percents = styled.span`
  color: ${COLORS.slateGray};
  margin-left: 3px;
`

const ChevronIcon = styled(ChevronIconSVG)`
  width: 13px;
  float: right;
  margin-right: 10px;
  margin-top: 0;
  transform: ${props => !props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: all 0.5;
  text-align: right;
  margin-left: auto;
`

export default SpeciesAndWeightChart
