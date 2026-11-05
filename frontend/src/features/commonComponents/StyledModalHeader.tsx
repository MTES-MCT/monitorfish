import Modal from 'rsuite/Modal'
import styled from 'styled-components'

export const StyledModalHeader = styled(Modal.Header)`
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  padding: ${p => (p.$isFull ? '5px 14px 8px 14px' : '4px 14px 5px 14px')};
  background: ${p => p.theme.color.charcoal};

  .rs-modal-title {
    color: #f0f0f0;
    font-size: ${p => (p.$isFull ? 22 : 16)}px;
    font-weight: normal;
  }

  .rs-modal-header-close {
    right: 13px;
    top: 10px;
    color: ${p => p.theme.color.gainsboro};
    margin: unset;
    padding: unset;

    &:hover {
      right: 13px;
    }
  }

  .rs-icon {
    width: 21px;
    height: 21px;
  }
`
