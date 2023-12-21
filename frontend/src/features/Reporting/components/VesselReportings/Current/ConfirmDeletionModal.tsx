import { Modal } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../../../constants/constants'
import StyledModalHeader from '../../../../commonComponents/StyledModalHeader'
import { CancelButton, ValidateButton } from '../../../../commonStyles/Buttons.style'

export function ConfirmDeletionModal({ closeModal, isOpened, validateCallback }) {
  return (
    <ModalWithCustomHeight backdrop onClose={closeModal} open={isOpened} size="xs" style={{ marginTop: 100 }}>
      <StyledModalHeader>
        <Modal.Title>
          <Title>Voulez-vous supprimer le signalement ?</Title>
        </Modal.Title>
      </StyledModalHeader>
      <Body>
        <FooterButton>
          <ValidateButton
            data-cy="confirm-reporting-deletion-button"
            onClick={() => {
              validateCallback()
              closeModal()
            }}
            // TODO Migrate to MonitorFish <Button /> library component
            // @ts-ignore
            width="120px"
          >
            Oui
          </ValidateButton>
          <CancelButton
            data-cy="close-reporting-deletion-modal"
            onClick={closeModal}
            // TODO Migrate to MonitorFish <Button /> library component
            // @ts-ignore
            width="120px"
          >
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
  color: ${COLORS.gainsboro};
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
