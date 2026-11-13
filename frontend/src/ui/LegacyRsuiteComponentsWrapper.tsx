import styled from 'styled-components'

export const LegacyRsuiteComponentsWrapper = styled.div`
  .rs-calendar-table-cell-is-today .rs-calendar-table-cell-content {
    border: 1px solid ${p => p.theme.color.slateGray} !important;
  }

  .rs-calendar-table-cell-content {
    border-radius: 2px !important;
  }

  .hover-border:hover {
    border-bottom: 1px solid ${p => p.theme.color.gunMetal};
    box-sizing: border-box;
  }
`
