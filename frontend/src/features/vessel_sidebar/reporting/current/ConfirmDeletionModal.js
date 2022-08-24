import React from 'react'
import { useDispatch } from 'react-redux'
import { Modal } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import deleteReporting from '../../../../domain/use_cases/reporting/deleteReporting'
import StyledModalHeader from '../../../commonComponents/StyledModalHeader'
import { CancelButton, ValidateButton } from '../../../commonStyles/Buttons.style'

function ConfirmDeletionModal({ closeModal, modalIsOpenForId }) {
  const dispatch = useDispatch()

  return (
    <ModalWithCustomHeight backdrop onClose={closeModal} open={modalIsOpenForId} size="xs" style={{ marginTop: 100 }}>
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
              dispatch(deleteReporting(modalIsOpenForId))
              closeModal()
            }}
            width="120px"
          >
            Oui
          </ValidateButton>
          <CancelButton data-cy="close-reporting-deletion-modal" onClick={closeModal} width="120px">
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

export default ConfirmDeletionModal
