import styled from 'styled-components'

export type InfoPointProps = {
  backgroundColor?: string
  color?: string
  dataCy?: string
  margin?: string
  onMouseEnter?: () => void
  onMouseOut?: () => void
  title?: string | undefined
}
export function InfoPoint({ backgroundColor, color, dataCy, margin, onMouseEnter, onMouseOut, title }: InfoPointProps) {
  return (
    <Wrapper
      $backgroundColor={backgroundColor}
      $color={color}
      $margin={margin}
      data-cy={dataCy}
      onMouseEnter={onMouseEnter}
      onMouseOut={onMouseOut}
      title={title}
    >
      !
    </Wrapper>
  )
}

const Wrapper = styled.a<{
  $backgroundColor: string | undefined
  $color: string | undefined
  $margin: string | undefined
}>`
  display: inline-block;
  align-self: start;
  min-height: 14px;
  min-width: 14px;
  height: 14px;
  width: 14px;
  border-radius: 50%;
  ${p => (p.$margin ? `$margin: ${p.$margin};` : '')}
  background: ${p => (p.$backgroundColor ? p.$backgroundColor : p.theme.color.slateGray)} 0% 0% no-repeat padding-box;
  color: ${p => (p.$color ? p.$color : p.theme.color.white)};
  text-align: center;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  line-height: 12px;
  &:hover {
    text-decoration: none;
    ${p => (p.$color ? p.$color : p.theme.color.white)};
    color: ${p => (p.$color ? p.$color : p.theme.color.white)};
  }
  &:focus {
    text-decoration: none;
    background-color: ${p => (p.$backgroundColor ? p.$backgroundColor : p.theme.color.charcoal)};
  }
  cursor: help;
`
