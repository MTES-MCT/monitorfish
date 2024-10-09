import { Modal } from 'rsuite'
import styled from 'styled-components'

import { StyledModalHeader } from '../../../commonComponents/StyledModalHeader'
import { CancelButton, ValidateButton } from '../../../commonStyles/Buttons.style'

// TODO Delete this component and use generic `<ConfirmationModal />` component.
export function DeletionConfirmationModal({ onCancel, onConfirm }) {
  return (
    <ModalWithCustomHeight backdrop onClose={onCancel} open size="xs" style={{ marginTop: 100 }}>
      <StyledModalHeader>
        <Modal.Title>
          <Title>Voulez-vous supprimer le signalement ?</Title>
        </Modal.Title>
      </StyledModalHeader>
      <Body>
        <FooterButton>
          <ValidateButton data-cy="confirm-reporting-deletion-button" onClick={onConfirm} style={{ width: 120 }}>
            Oui
          </ValidateButton>
          <CancelButton data-cy="close-reporting-deletion-modal" onClick={onCancel} style={{ width: 120 }}>
            Non
          </CancelButton>
        </FooterButton>
      </Body>
    </ModalWithCustomHeight>
  )
}

const Title = styled.div`
  font-size: 16px;
  line-height: 30px;
  color: ${p => p.theme.color.gainsboro};
`

const Body = styled(Modal.Body)`
  padding: 20px 25px 0 25px !important;
  text-align: center;
`

const ModalWithCustomHeight = styled(Modal)`
  .rs-modal-content {
    height: 150px !important;
  }
`

const FooterButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  padding: 15px 0;
`
