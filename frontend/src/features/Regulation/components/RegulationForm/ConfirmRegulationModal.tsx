import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import styled from 'styled-components'

import { FooterButton } from '../../../commonStyles/Backoffice.style'
import { CancelButton, ValidateButton } from '../../../commonStyles/Buttons.style'
import CloseIconSVG from '../../../icons/Croix_grise_clair.svg?react'
import { regulationActions } from '../../slice'

export function ConfirmRegulationModal({ goBackofficeHome }) {
  const dispatch = useBackofficeAppDispatch()
  const { isConfirmModalOpen } = useBackofficeAppSelector(state => state.regulation)

  const save = () => {
    dispatch(regulationActions.setIsConfirmModalOpen(false))
    dispatch(regulationActions.setSaveOrUpdateRegulation(true))
  }

  const close = () => {
    dispatch(regulationActions.setIsConfirmModalOpen(false))
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
            <ValidateButton data-cy="confirm-modal-confirm-button" onClick={save} style={{ width: 120 }}>
              Oui
            </ValidateButton>
            <CancelButton data-cy="confirm-modal-cancel-button" onClick={goBackofficeHome} style={{ width: 120 }}>
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
  background-color: ${p => p.theme.color.white};
  border-top: 1px solid ${p => p.theme.color.lightGray};
`

const CloseIcon = styled(CloseIconSVG)`
  width: 16px;
  vertical-align: text-bottom;
  cursor: pointer;
  float: right;
`

const RegulationModal = styled.div<{
  $isOpen: boolean
}>`
  display: ${p => (p.$isOpen ? 'block' : 'none')};
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
  background-color: ${p => p.theme.color.white};
  overflow: hidden;
`

const ModalTitle = styled.div`
  background-color: ${p => p.theme.color.charcoal};
  text-align: center;
  padding: 9px;
  font-size: 13px;
  box-sizing: border-box;
  width: 100%;
  color: ${p => p.theme.color.white};
`

const Section = styled.div`
  padding: 35px 42px;
  text-align: center;
`
