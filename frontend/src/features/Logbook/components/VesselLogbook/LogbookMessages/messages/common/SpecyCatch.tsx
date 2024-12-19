import { Icon } from '@mtes-mct/monitor-ui'
import { useMemo, useState } from 'react'
import styled from 'styled-components'

import { WeightType } from '../../constants'

import type { CatchWithProperties, ProtectedCatchWithProperties } from '../../../types'
import type { ReactNode } from 'react'

type SpecyCatchProps = Readonly<{
  children: ReactNode
  isOpenable?: boolean
  isProtectedSpecy?: boolean
  specyCatch: CatchWithProperties | ProtectedCatchWithProperties
  weightType: WeightType
}>
export function SpecyCatch({
  children,
  isOpenable = true,
  isProtectedSpecy = false,
  specyCatch,
  weightType
}: SpecyCatchProps) {
  const [isOpen, setIsOpen] = useState(false)

  const specyFullName = useMemo(() => {
    if (specyCatch.speciesName && specyCatch.species) {
      return `${specyCatch.speciesName} (${specyCatch.species})`
    }

    return specyCatch.species
  }, [specyCatch])

  return (
    <Species>
      <Title $isOpen={isOpen} $isOpenable={isOpenable} onClick={() => isOpenable && setIsOpen(!isOpen)}>
        <SpecyName $width={specyCatch.nbFish > 0 ? 157 : 168} title={specyFullName}>
          {specyFullName}
        </SpecyName>
        <SpecyWeight title={`${specyCatch.weight} kg (${weightType})`}>
          <SpecyWeightLabel>Poids total ({weightType})</SpecyWeightLabel>
          <SpecyWeightValue $width={58} data-cy="SpecyCatch-weight">
            {specyCatch.weight ? `${specyCatch.weight} kg` : <NoValue>-</NoValue>}
          </SpecyWeightValue>
        </SpecyWeight>
        {specyCatch.nbFish > 0 && (
          <SpecyWeight title={`${specyCatch.nbFish} pièces`}>
            <SpecyWeightLabel>Pc.</SpecyWeightLabel>
            <SpecyWeightValue $width={38}>{specyCatch.nbFish || <NoValue>-</NoValue>}</SpecyWeightValue>
          </SpecyWeight>
        )}
        {isOpenable && <ChevronIcon $isOpen={isOpen} size={17} />}
      </Title>
      <Content $isOpen={isOpen} $isProtectedSpecy={isProtectedSpecy} $length={specyCatch.properties.length || 1}>
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
  background: ${p => p.theme.color.lightGray};
  padding: 5px 5px 5px 10px;
  height: 20px;
  width: inherit;
  font-size: 13px;
`

const Title = styled.div<{
  $isOpen: boolean
  $isOpenable: boolean
}>`
  border-bottom: ${p => (p.$isOpen ? `1px solid ${p.theme.color.lightGray}` : 'unset')};
  cursor: ${p => (p.$isOpenable ? 'pointer' : 'unset')};
  display: flex;
  overflow: hidden;
  padding: 8px 0;
  user-select: none;
  width: inherit;
`

const SpecyName = styled.span<{
  $width: number
}>`
  color: ${p => p.theme.color.gunMetal};
  font-size: 13px;
  line-height: 18px;
  margin-left: 16px;
  max-width: ${p => p.$width}px;
  min-width: ${p => p.$width}px;
  padding-right: 12px;
  overflow: hidden !important;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const SpecyWeight = styled.span`
  color: ${p => p.theme.color.gunMetal};
  flex-grow: 1;
  font-size: 13px;
  line-height: 18px;
  padding-right: 12px;
  white-space: nowrap;
`

const SpecyWeightLabel = styled.span`
  color: ${p => p.theme.color.slateGray};
  display: inline-block;
  font-size: 13px;
`

const SpecyWeightValue = styled.span<{
  $width: number
}>`
  display: inline-block;
  height: 20px;
  margin-left: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: top;
  width: ${p => p.$width}px;
`

const Species = styled.li`
  margin: 0;
  background: ${p => p.theme.color.white};
  border-radius: 0;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  color: ${p => p.theme.color.slateGray};
`

const Content = styled.div<{
  $isOpen: boolean
  $isProtectedSpecy: boolean
  $length: number
}>`
  width: inherit;
  height: 0;
  overflow: hidden;
  padding: 0;
  border-bottom: 1px solid ${p => p.theme.color.lightGray};
  height: ${p => (p.$isOpen ? p.$length * (p.$isProtectedSpecy ? 198 : 99) + (p.$length > 1 ? 35 : 5) : 0)}px;
  transition: 0.2s all;
`

const ChevronIcon = styled(Icon.Chevron)<{
  $isOpen: boolean
}>`
  margin-right: 12px;
  transform: rotate(${p => (p.$isOpen ? 180 : 0)}deg);
  transition: all 0.2s ease;
`

const NoValue = styled.span`
  color: ${p => p.theme.color.slateGray};
  font-weight: 300;
  line-height: normal;
  display: inline-block;
`
