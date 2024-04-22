import countries from 'i18n-iso-countries'
import styled from 'styled-components'

import { getAlpha2CodeFromAlpha2or3Code } from './utils'

import type { CSSProperties } from 'react'

type CountryFlagProps = Readonly<{
  className?: string | undefined
  countryCode: string | undefined
  size: [number, number]
  style?: CSSProperties | undefined
}>
export function CountryFlag({ countryCode, size, ...nativeProps }: CountryFlagProps) {
  const countryAlpha2Code = getAlpha2CodeFromAlpha2or3Code(countryCode)
  const countryName = countryAlpha2Code ? countries.getName(countryAlpha2Code, 'fr') : undefined
  const [width, height] = size

  const url = countryAlpha2Code ? `/flags/${countryAlpha2Code}.svg` : `https://placehold.co/${width}x${height}?text=%3F`

  if (!countryAlpha2Code || countryAlpha2Code === 'undefined') {
    return <Unknown $height={height} $width={width} title="Inconnu" {...nativeProps} />
  }

  return (
    <Img $height={height} $width={width} alt={String(countryCode)} src={url} title={countryName} {...nativeProps} />
  )
}

const Img = styled.img<{
  $height: number
  $width: number
}>`
  height: ${p => p.$height}px;
  width: ${p => p.$width}px;
`

const Unknown = styled.span<{
  $height: number
  $width: number
}>`
  background-color: black;
  display: inline-block;
  height: ${p => p.$height}px;
  width: ${p => p.$width}px;
`
