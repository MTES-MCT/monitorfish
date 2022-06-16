import React from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { CancelButton, ValidateButton } from '../../../commonStyles/Buttons.style'
import Modal from 'rsuite/lib/Modal'
import deleteReporting from '../../../../domain/use_cases/reporting/deleteReporting'

const ConfirmDeletionModal = ({ modalIsOpenForId, closeModal }) => {
  const dispatch = useDispatch()

  return (
    <ModalWithCustomHeight
      size={'xs'}
      backdrop
      show={modalIsOpenForId}
      style={{ marginTop: 100 }}
      onHide={closeModal}
    >
      <Modal.Header>
        <Modal.Title>
          <Title>
            Voulez-vous supprimer le signalement ?
          </Title>
        </Modal.Title>
      </Modal.Header>
      <Body>
        <FooterButton>
          <ValidateButton
            onClick={() => {
              dispatch(deleteReporting(modalIsOpenForId))
              closeModal()
            }}
            width={'120px'}
            data-cy='confirm-reporting-deletion-button'
          >
            Oui
          </ValidateButton>
          <CancelButton
            onClick={closeModal}
            width={'120px'}
            data-cy='close-reporting-deletion-modal'
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

export default ConfirmDeletionModal
