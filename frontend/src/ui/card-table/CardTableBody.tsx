import styled from 'styled-components'

export const CardTableBody = styled.div.attrs(() => ({
  role: 'rowgroup'
}))`
  overflow-y: auto;
  max-height: calc(100vh - 170px);
`
