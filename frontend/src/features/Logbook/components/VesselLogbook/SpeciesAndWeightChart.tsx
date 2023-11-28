import { useEffect, useState } from 'react'
import styled from 'styled-components'

import ChevronIconSVG from '../../../icons/Chevron_simple_gris.svg?react'
import { LogbookSpeciesPresentation } from '../../constants'

import type { SpeciesInsight, SpeciesInsightWithHeight } from '../../types'

function getHeight(weight, percentOfTotalFARWeight) {
  let height = weight ? Math.log10(percentOfTotalFARWeight) : 22

  height *= 50
  height = height <= 22 ? 22 : height
  height = height > 90 ? 90 : height

  return height
}

type SpeciesAndWeightChartProps = {
  compareWithTotalWeight: boolean
  increaseChartTotalHeight?: (height: number) => void
  resetInitialChartHeight?: () => void
  setChartHeight: (height: number) => void
  speciesAndWeightArray: SpeciesInsight[]
  speciesPresentationAndWeightArray?: {
    presentation: string
    weight: number
  }[][]
}
export function SpeciesAndWeightChart({
  compareWithTotalWeight,
  increaseChartTotalHeight,
  resetInitialChartHeight,
  setChartHeight,
  speciesAndWeightArray,
  speciesPresentationAndWeightArray
}: SpeciesAndWeightChartProps) {
  const [speciesAndWeightArrayWithHeight, setSpeciesAndWeightArrayWithHeight] = useState<SpeciesInsightWithHeight[]>([])
  // TODO Type that.
  const [speciesPresentationOpened, setSpeciesPresentationOpened] = useState(null)

  useEffect(
    () => {
      if (speciesAndWeightArrayWithHeight && setChartHeight) {
        const nextSpeciesAndWeightArrayWithHeight = speciesAndWeightArray.map(speciesAndWeight => {
          // eslint-disable-next-line no-param-reassign
          ;(speciesAndWeight as SpeciesInsightWithHeight).height = getHeight(
            speciesAndWeight.weight,
            getPercentOfTotalFARWeight(speciesAndWeight)
          )

          return speciesAndWeight as SpeciesInsightWithHeight
        })

        setSpeciesAndWeightArrayWithHeight(nextSpeciesAndWeightArrayWithHeight)
        const totalHeight = nextSpeciesAndWeightArrayWithHeight.reduce(
          (subAccumulator, speciesCatch) => subAccumulator + speciesCatch.height + 2,
          0
        )

        setChartHeight(totalHeight)
      }
    },

    // TODO Fix missing `setChartHeight` dependency using a useCallback hook.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [speciesAndWeightArray]
  )

  const openPresentation = (species, speciesPresentationAndWeight) => {
    const height = speciesPresentationAndWeight ? speciesPresentationAndWeight.length * 22 + 4 : 0

    if (speciesPresentationOpened === species && resetInitialChartHeight) {
      setSpeciesPresentationOpened(null)
      resetInitialChartHeight()
    } else if (increaseChartTotalHeight) {
      setSpeciesPresentationOpened(species)
      increaseChartTotalHeight(height)
    }
  }

  const getPercentOfTotalFARWeight = speciesAndWeight =>
    parseFloat(((speciesAndWeight.weight * 100) / speciesAndWeight.totalWeight).toFixed(1))

  const getPercentOfPresentationToSpeciesWeight = (presentationWeight, speciesWeight) =>
    parseFloat(((presentationWeight * 100) / speciesWeight).toFixed(1))

  return (
    <>
      {speciesAndWeightArrayWithHeight && speciesAndWeightArrayWithHeight.length
        ? speciesAndWeightArrayWithHeight.map((speciesAndWeight, index) => (
            <Wrapper key={speciesAndWeight.species}>
              <SpeciesAndWeight>
                <Weight
                  hasPresentation={!!speciesPresentationAndWeightArray}
                  height={speciesAndWeight.height}
                  isLast={
                    index === speciesAndWeightArrayWithHeight.length - 1 &&
                    speciesAndWeight.species !== speciesPresentationOpened
                  }
                  onClick={() =>
                    speciesPresentationAndWeightArray
                      ? openPresentation(speciesAndWeight.species, speciesPresentationAndWeightArray[index])
                      : undefined
                  }
                >
                  <WeightText>
                    {parseFloat(speciesAndWeight.weight.toFixed(1))} kg{' '}
                    {compareWithTotalWeight ? <Gray>({getPercentOfTotalFARWeight(speciesAndWeight)} %)</Gray> : null}
                  </WeightText>
                  {speciesPresentationAndWeightArray ? (
                    <ChevronIcon $isOpen={speciesAndWeight.species === speciesPresentationOpened} />
                  ) : null}
                </Weight>
                <Species
                  height={speciesAndWeight.height}
                  isLast={
                    index === speciesAndWeightArrayWithHeight.length - 1 &&
                    speciesAndWeight.species !== speciesPresentationOpened
                  }
                >
                  {speciesAndWeight.speciesName ? (
                    <>
                      {speciesAndWeight.speciesName} ({speciesAndWeight.species})
                    </>
                  ) : (
                    speciesAndWeight.species
                  )}
                </Species>
              </SpeciesAndWeight>
              <PresentationWrapper isOpen={speciesAndWeight.species === speciesPresentationOpened}>
                {speciesPresentationAndWeightArray && speciesPresentationAndWeightArray[index]
                  ? speciesPresentationAndWeightArray[index]?.map((speciesAndPresentation, presentationIndex) => (
                      <SpeciesAndPresentation key={speciesAndPresentation.presentation}>
                        <PresentationWeight
                          isLast={presentationIndex === Number(speciesPresentationAndWeightArray[index]?.length) - 1}
                        >
                          {speciesAndPresentation.weight} kg
                          <Percents>
                            (
                            {getPercentOfPresentationToSpeciesWeight(
                              speciesAndPresentation.weight,
                              speciesAndWeight.weight
                            )}{' '}
                            %)
                          </Percents>
                        </PresentationWeight>
                        <Presentation>
                          {speciesAndPresentation.presentation ? (
                            <>
                              {LogbookSpeciesPresentation[speciesAndPresentation.presentation]} (
                              {speciesAndPresentation.presentation}) (poids vif)
                            </>
                          ) : (
                            'Inconnu'
                          )}
                        </Presentation>
                      </SpeciesAndPresentation>
                    ))
                  : null}
              </PresentationWrapper>
            </Wrapper>
          ))
        : null}
    </>
  )
}

const Presentation = styled.div`
  height: 20px;
  margin: 2px 0 0 10px;
  font-size: 13px;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 252px;
`

const Wrapper = styled.div``

const Gray = styled.span`
  color: ${p => p.theme.color.slateGray};
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

const PresentationWrapper = styled.div<{
  isOpen: boolean
}>`
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  height: ${props => (props.isOpen ? 'inherit' : '0px')};
`

const Species = styled.div<{
  height: number
  isLast: boolean
}>`
  display: flex;
  height: ${props => props.height}px;
  min-height: 20px;
  max-height: 90px;
  align-items: center;
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  margin: 2px 0 0 10px;
  ${p => (p.isLast ? 'margin-bottom: 2px ;' : '')}
  font-weight: 500;
  max-width: 260px;
  white-space: nowrap;
  text-overflow: ellipsis;
`

const WeightText = styled.span``

const Weight = styled.div<{
  hasPresentation: boolean
  height: number
  isLast: boolean
}>`
  width: 130px;
  background: ${p => p.theme.color.gainsboro} 0% 0% no-repeat padding-box;
  font-weight: 500;
  border-left: 2px solid ${p => p.theme.color.slateGray};
  border-right: 2px solid ${p => p.theme.color.slateGray};
  border-top: 2px solid ${p => p.theme.color.slateGray};
  ${p => (p.isLast ? `border-bottom: 2px solid ${p.theme.color.slateGray};` : '')}
  height: ${p => p.height}px;
  min-height: 20px;
  max-height: 90px;
  color: ${p => p.theme.color.gunMetal};
  font-size: 11px;
  display: flex;
  align-items: center;
  text-align: left;
  padding-left: 10px;
  ${p => (p.hasPresentation ? 'cursor: pointer;' : null)}
`

const PresentationWeight = styled.div<{
  isLast: boolean
}>`
  width: 130px;
  font-weight: normal;
  border-left: 2px solid ${p => p.theme.color.slateGray};
  border-right: 2px solid ${p => p.theme.color.slateGray};
  border-top: 2px solid ${p => p.theme.color.slateGray};
  ${p => (p.isLast ? `border-bottom: 2px solid ${p.theme.color.slateGray};` : '')}
  ${p => (p.isLast ? 'margin-bottom: 4px;' : '')}
  height: 20px;
  font-size: 11px;
  display: flex;
  align-items: center;
  padding-left: 10px;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 300;
`

const Percents = styled.span`
  color: ${p => p.theme.color.slateGray};
  margin-left: 3px;
`

const ChevronIcon = styled(ChevronIconSVG)<{
  $isOpen: boolean
}>`
  width: 13px;
  float: right;
  margin-right: 10px;
  margin-top: 0;
  transform: ${p => (!p.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: all 0.5;
  text-align: right;
  margin-left: auto;
`
