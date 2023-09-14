import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { SpecyCatchDetail } from './SpecyCatchDetail'
import { COLORS } from '../../../../../constants/constants'
import { ReactComponent as ChevronIconSVG } from '../../../../icons/Chevron_simple_gris.svg'
import { ReactComponent as WarningSVG } from '../../../../icons/Point_exclamation_info.svg'

import type { LogbookCatchesBySpecy } from '../../../types'
import type { HTMLProps } from 'react'

export enum WeightType {
  LIVE = 'vif',
  NET = 'net'
}

type LogbookMessageSpeciesType = {
  isLast: boolean
  specyCatches: LogbookCatchesBySpecy
  weightType: WeightType
}
export function LogbookMessageSpecy({ isLast, specyCatches, weightType }: LogbookMessageSpeciesType) {
  const [isOpen, setIsOpen] = useState(false)

  const specyFullName = useMemo(() => {
    if (specyCatches.speciesName && specyCatches.species) {
      return `${specyCatches.speciesName} (${specyCatches.species})`
    }

    return specyCatches.species
  }, [specyCatches])

  return (
    <Species>
      <Title isLast={isLast} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <TitleText title={specyFullName}>{specyFullName}</TitleText>
        <Weight title={`${specyCatches.weight} kg (${weightType})`}>
          <InlineKey>Poids total ({weightType})</InlineKey>
          <Kg>{specyCatches.weight || <NoValue>-</NoValue>} kg</Kg>
        </Weight>
        <ChevronIcon $isOpen={isOpen} />
      </Title>
      <Content isOpen={isOpen} length={specyCatches.properties.length || 1}>
        {specyCatches.properties.length > 1 && (
          <MultipleProperties>
            <Warning /> Plusieurs zones de pêche et/ou présentations pour cette espèce
          </MultipleProperties>
        )}
        {specyCatches.properties.map(specyCatch => (
          <SpecyCatchDetail specyCatch={specyCatch} weightType={weightType} />
        ))}
      </Content>
    </Species>
  )
}

const Warning = styled(WarningSVG)`
  width: 15px;
  margin-bottom: -2px;
  margin-right: 5px;
`

const MultipleProperties = styled.div`
  background: ${COLORS.lightGray};
  padding: 5px 5px 5px 10px;
  height: 20px;
  width: inherit;
  font-size: 13px;
`

const Kg = styled.span`
  width: 60px;
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
  height: 20px;
  vertical-align: top;
`

const InlineKey = styled.div`
  color: ${COLORS.slateGray};
  display: inline-block;
  padding: 0px 5px 0px 10px;
  font-size: 13px;
`

const TitleText = styled.span<HTMLProps<HTMLDivElement>>`
  color: ${COLORS.gunMetal};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
  text-overflow: ellipsis;
  overflow: hidden !important;
  white-space: nowrap;
  max-width: 180px;
`

const Weight = styled.span`
  color: ${COLORS.gunMetal};
  margin: 5px 5px 5px 0;
  padding: 2px 4px 2px 0;
  font-size: 13px;
  margin-left: auto;
`

const Species = styled.li`
  margin: 0;
  background: ${COLORS.white};
  border-radius: 0;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${COLORS.slateGray};
`

const Title = styled.div<{
  isLast: boolean
  isOpen: boolean
}>`
  height: 35px;
  width: inherit;
  padding: 0 0 0 20px;
  user-select: none;
  cursor: pointer;
  border-bottom: ${p => (p.isOpen ? `1px solid ${p.theme.color.lightGray}` : 'unset')};
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
`

const Content = styled.div<{
  isOpen: boolean
  length: number
}>`
  width: inherit;
  height: 0;
  overflow: hidden;
  padding: 0;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  height: ${p => (p.isOpen ? p.length * 115 + (p.length > 1 ? 30 : 0) : 0)}px;
  transition: 0.2s all;
`

const ChevronIcon = styled(ChevronIconSVG)<{
  $isOpen: boolean
}>`
  transform: rotate(${p => (p.$isOpen ? 0 : 180)}deg);
  width: 17px;
  float: right;
  margin-right: 10px;
  margin-top: 2px;
  transition: all 0.2s ease forwards;
`

const NoValue = styled.span`
  color: ${COLORS.slateGray};
  font-weight: 300;
  line-height: normal;
  width: 50px;
  display: inline-block;
`
