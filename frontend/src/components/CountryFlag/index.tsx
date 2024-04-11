import styled from 'styled-components'

import { getAlpha2CodeFromAlpha2or3Code } from './utils'

type CountryFlagProps = Readonly<{
  countryCode: string | undefined
  size: [number, number]
}>
export function CountryFlag({ countryCode, size }: CountryFlagProps) {
  const countryAlpha2Code = getAlpha2CodeFromAlpha2or3Code(countryCode)
  const [width, height] = size

  const url = countryAlpha2Code ? `/flags/${countryAlpha2Code}.svg` : `https://placehold.co/${width}x${height}?text=%3F`

  return <Img $height={height} $width={width} alt={String(countryCode)} src={url} title={url} />
}

const Img = styled.img<{
  $height: number
  $width: number
}>`
  height: ${p => p.$height}px;
  width: ${p => p.$width}px;
`
