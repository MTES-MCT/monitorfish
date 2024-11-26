import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import Feature from 'ol/Feature'
import styled from 'styled-components'

import { FooterButton } from '../../../../commonStyles/Backoffice.style'
import { ValidateButton, CancelButton } from '../../../../commonStyles/Buttons.style'
import CloseIconSVG from '../../../../icons/Croix_grise_clair.svg?react'
import { regulationActions } from '../../../slice'
import { updateRegulation } from '../../../useCases/updateRegulation'
import { RegulationActionType, getRegulatoryFeatureId } from '../../../utils'

export function RemoveRegulationModal() {
  const dispatch = useBackofficeAppDispatch()
  const { isRemoveModalOpen, processingRegulation } = useBackofficeAppSelector(state => state.regulation)

  const deleteRegulation = () => {
    const feature = new Feature({})
    feature.setId(getRegulatoryFeatureId(processingRegulation.id))
    dispatch(updateRegulation(feature, RegulationActionType.Delete))
  }

  return (
    <RegulationModal $isOpen={isRemoveModalOpen}>
      <ModalContent>
        <Body>
          <ModalTitle>
            Supprimer la réglementation
            <CloseIcon onClick={() => dispatch(regulationActions.setIsRemoveModalOpen(false))} />
          </ModalTitle>
          <Section>
            {
              'Confirmez-vous la suppression définitive de cette réglementation et de son tracé ? \n Cette action est irréversible.'
            }
          </Section>
        </Body>
        <Footer>
          <FooterButton>
            <ValidateButton onClick={deleteRegulation} style={{ width: 120 }}>
              Oui
            </ValidateButton>
            <CancelButton
              onClick={() => dispatch(regulationActions.setIsRemoveModalOpen(false))}
              style={{ width: 120 }}
            >
              Annuler
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
