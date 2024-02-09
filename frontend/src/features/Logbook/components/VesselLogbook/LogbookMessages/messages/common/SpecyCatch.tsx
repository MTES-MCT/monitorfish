import { Icon } from '@mtes-mct/monitor-ui'
import { ReactNode, useMemo, useState } from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../../../../../constants/constants'
import ChevronIconSVG from '../../../../../../icons/Chevron_simple_gris.svg?react'
import { WeightType } from '../../constants'

import type { CatchWithProperties, ProtectedCatchWithProperties } from '../../../types'
import type { HTMLProps } from 'react'

type SpecyCatchProps = {
  children: ReactNode
  isLast: boolean
  isProtectedSpecies?: boolean
  specyCatch: CatchWithProperties | ProtectedCatchWithProperties
  weightType: WeightType
}
export function SpecyCatch({ children, isLast, isProtectedSpecies = false, specyCatch, weightType }: SpecyCatchProps) {
  const [isOpen, setIsOpen] = useState(false)

  const specyFullName = useMemo(() => {
    if (specyCatch.speciesName && specyCatch.species) {
      return `${specyCatch.speciesName} (${specyCatch.species})`
    }

    return specyCatch.species
  }, [specyCatch])

  return (
    <Species>
      <Title isLast={isLast} isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <TitleText title={specyFullName}>{specyFullName}</TitleText>
        <Weight title={`${specyCatch.weight} kg (${weightType})`}>
          <InlineKey>Poids total ({weightType})</InlineKey>
          <Kg>{specyCatch.weight || <NoValue>-</NoValue>} kg</Kg>
        </Weight>
        <ChevronIcon $isOpen={isOpen} />
      </Title>
      <Content isOpen={isOpen} isProtectedSpecies={isProtectedSpecies} length={specyCatch.properties.length || 1}>
        {specyCatch.properties.length > 1 && (
          <MultipleProperties>
            <Icon.Warning size={20} />{' '}
            <WarningText>Plusieurs zones de pêche et/ou présentations pour cette espèce</WarningText>
          </MultipleProperties>
        )}
        {children}
      </Content>
    </Species>
  )
}

const WarningText = styled.span`
  vertical-align: top;
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
  isProtectedSpecies: boolean
  length: number
}>`
  width: inherit;
  height: 0;
  overflow: hidden;
  padding: 0;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  height: ${p => (p.isOpen ? p.length * (p.isProtectedSpecies ? 198 : 99) + (p.length > 1 ? 35 : 5) : 0)}px;
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
