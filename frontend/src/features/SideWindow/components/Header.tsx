import styled from 'styled-components'

const RawHeader = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  border-bottom: solid 2px ${p => p.theme.color.gainsboro};
  display: flex;
  justify-content: space-between;
  min-height: 80px;
  padding: 0 32px;
`

const Title = styled.h1`
  color: ${p => p.theme.color.charcoal};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
`

export const Header = Object.assign(RawHeader, {
  Title
})
