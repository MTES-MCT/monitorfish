import styled from 'styled-components'

const RawHeader = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.white};
  display: flex;
  justify-content: space-between;
  padding: 40px 32px 0;
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
