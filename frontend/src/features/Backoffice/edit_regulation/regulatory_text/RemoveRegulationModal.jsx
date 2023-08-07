import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { setIsRemoveModalOpen } from '../../slice'
import { ValidateButton, CancelButton } from '../../../commonStyles/Buttons.style'
import { FooterButton } from '../../../commonStyles/Backoffice.style'
import { ReactComponent as CloseIconSVG } from '../../../icons/Croix_grise_clair.svg'
import updateRegulation from '../../../../domain/use_cases/layer/regulation/updateRegulation'
import Feature from 'ol/Feature'
import { REGULATION_ACTION_TYPE, getRegulatoryFeatureId } from '../../../../domain/entities/regulation'

const RemoveRegulationModal = () => {
  const dispatch = useDispatch()
  const { isRemoveModalOpen, processingRegulation } = useSelector(state => state.regulation)

  const deleteRegulation = () => {
    const feature = new Feature({})
    feature.setId(getRegulatoryFeatureId(processingRegulation.id))
    dispatch(updateRegulation(feature, REGULATION_ACTION_TYPE.DELETE))
  }

  return (
    <RegulationModal isOpen={isRemoveModalOpen}>
      <ModalContent>
        <Body>
          <ModalTitle>
            Supprimer la réglementation
            <CloseIcon onClick={() => dispatch(setIsRemoveModalOpen(false))} />
          </ModalTitle>
          <Section>
            {
              'Confirmez-vous la suppression définitive de cette réglementation et de son tracé ? \n Cette action est irréversible.'
            }
          </Section>
        </Body>
        <Footer>
          <FooterButton>
            <ValidateButton onClick={deleteRegulation} width={'120px'}>
              Oui
            </ValidateButton>
            <CancelButton onClick={() => dispatch(setIsRemoveModalOpen(false))} width={'120px'}>
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
  display: ${props => (props.isOpen ? 'block' : 'none')};
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

export default RemoveRegulationModal
