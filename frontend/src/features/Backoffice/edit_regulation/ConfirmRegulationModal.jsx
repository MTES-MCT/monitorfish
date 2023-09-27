import React from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { setIsConfirmModalOpen, setRegulationModified, setSaveOrUpdateRegulation } from '../slice'
import { CancelButton, ValidateButton } from '../../commonStyles/Buttons.style'
import { FooterButton } from '../../commonStyles/Backoffice.style'
import CloseIconSVG from '../../icons/Croix_grise_clair.svg?react'

const ConfirmRegulationModal = ({ goBackofficeHome }) => {
  const dispatch = useDispatch()
  const { isConfirmModalOpen } = useSelector(state => state.regulation)

  const save = () => {
    batch(() => {
      dispatch(setIsConfirmModalOpen(false))
      dispatch(setSaveOrUpdateRegulation(true))
      dispatch(setRegulationModified(false))
    })
  }

  const close = () => {
    dispatch(setIsConfirmModalOpen(false))
    dispatch(setRegulationModified(false))
  }

  return (
    <RegulationModal $isOpen={isConfirmModalOpen} data-cy="regulation-modal">
      <ModalContent>
        <Body>
          <ModalTitle>
            Enregistrer les modifications
            <CloseIcon data-cy="confirm-modal-close-icon" onClick={close} />
          </ModalTitle>
          <Section data-cy="confirm-modal-text">
            {'Voulez-vous enregistrer les modifications\napportées à la réglementation ?'}
          </Section>
        </Body>
        <Footer>
          <FooterButton>
            <ValidateButton onClick={save} width={'120px'} data-cy="confirm-modal-confirm-button">
              Oui
            </ValidateButton>
            <CancelButton onClick={goBackofficeHome} width={'120px'} data-cy="confirm-modal-cancel-button">
              Non
            </CancelButton>
          </FooterButton>
        </Footer>
      </ModalContent>
    </RegulationModal>
  )
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
`

const Footer = styled.div`
  background-color: ${COLORS.white};
  border-top: 1px solid ${COLORS.lightGray};
`

const CloseIcon = styled(CloseIconSVG)`
  width: 16px;
  vertical-align: text-bottom;
  cursor: pointer;
  float: right;
`

const RegulationModal = styled.div`
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  overflow: none;
  width: 100%;
  height: 100vh;
  z-index: 1000;
  background-color: rgba(59, 69, 89, 0.5);
  position: fixed;
  top: 0;
`

const ModalContent = styled.div`
  position: absolute;
  left: calc(50% - 200px);
  top: 33%;
  width: 400px;
  box-sizing: border-box;
  background-color: ${COLORS.white};
  overflow: hidden;
`

const ModalTitle = styled.div`
  background-color: ${COLORS.charcoal};
  text-align: center;
  padding: 9px;
  font-size: 13px;
  box-sizing: border-box;
  width: 100%;
  color: ${COLORS.white};
`

const Section = styled.div`
  padding: 35px 42px;
  text-align: center;
`

export default ConfirmRegulationModal
