import styled from 'styled-components'

type LoaderProps = Readonly<{
  hasWhiteBackground?: boolean
}>
export function Loader({ hasWhiteBackground = false }: LoaderProps) {
  return (
    <Wrapper $hasWhiteBackground={hasWhiteBackground}>
      <p>Chargement en cours...</p>
    </Wrapper>
  )
}

export const Wrapper = styled.div<{
  $hasWhiteBackground: boolean
}>`
  background: ${p => (p.$hasWhiteBackground ? 'unset' : p.theme.color.gainsboro)};
  padding-right: 16px;
  padding-left: 16px;
`
