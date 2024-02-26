import styled from 'styled-components'

export const LegacyRsuiteComponentsWrapper = styled.div`
  .rs-picker {
    border-radius: 0;
    font-size: 13px;
    width: 100%;

    * {
      font-size: 13px;
    }

    [role='combobox'] {
      width: 100%;
    }

    .rs-picker-toggle-placeholder {
      font-size: 11px;
    }
  }

  .rs-checkbox {
    .rs-checkbox-wrapper {
      .rs-checkbox-inner {
        &:before {
          background-color: ${p => p.theme.color.gainsboro} !important;
          border: solid 2px ${p => p.theme.color.lightGray} !important;
          border-radius: 0;
        }
      }
    }

    &.rs-checkbox-checked {
      .rs-checkbox-wrapper {
        .rs-checkbox-inner {
          &:before {
            background-color: ${p => p.theme.color.charcoal} !important;
            border: solid 2px ${p => p.theme.color.charcoal} !important;
          }
        }
      }
    }
  }
`
