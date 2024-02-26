import styled from 'styled-components'
import Modal from 'rsuite/Modal'

const StyledModalHeader = styled(Modal.Header)`
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  padding: ${props => props.$isFull ? '5px 14px 8px 14px' : '4px 14px 5px 14px'};
  background: #3B4559;

  .rs-modal-title {
    color: #F0F0F0;
    font-size: ${props => props.$isFull ? 22 : 16}px;
    font-weight: normal;
  }

  .rs-modal-header-close {
    right: 13px;
    top: 10px;
    color: #E5E5EB;
    margin: unset;
    padding: unset;

    :hover {
      right: 13px;
    }
  }

  .rs-icon {
    width: 21px;
    height: 21px;
  }
`

export default StyledModalHeader
