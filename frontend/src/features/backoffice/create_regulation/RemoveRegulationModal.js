import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { setIsRemoveModalOpen } from '../Regulation.slice'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import { FooterButton } from '../../commonStyles/Backoffice.style'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise_clair.svg'
import manageRegulationInGeoserver from '../../../domain/use_cases/manageRegulationInGeoserver'
import Feature from 'ol/Feature'
import Layers from '../../../domain/entities/layers'
import { REGULATION_ACTION_TYPE } from '../../../domain/entities/regulatory'

const RemoveRegulationModal = () => {
  const dispatch = useDispatch()
  const {
    isRemoveModalOpen,
    selectedGeometryId
  } = useSelector(state => state.regulation)

  const deleteRegulation = () => {
    const feature = new Feature({})
    feature.setId(`${Layers.REGULATORY.code}_write.${selectedGeometryId}`)
    dispatch(manageRegulationInGeoserver(feature, REGULATION_ACTION_TYPE.DELETE))
  }

  return (<RegulationModal isOpen={isRemoveModalOpen}>
    <ModalContent>
      <Body>
        <ModalTitle>
          Supprimer la réglementation
          <CloseIcon onClick={() => dispatch(setIsRemoveModalOpen(false))}/>
        </ModalTitle>
        <Section>
          {'Confirmez-vous la suppression définitive de cette réglementation et de son tracé ? \n Cette action est irréversible.'}
        </Section>
      </Body>
      <Footer>
        <FooterButton>
          <ValidateButton
            disabled={false}
            isLast={false}
            onClick={deleteRegulation}
          >
            Oui
          </ValidateButton>
          <CancelButton
            disabled={false}
            isLast={false}
            onClick={() => dispatch(setIsRemoveModalOpen(false))}
          >
            Annuler
          </CancelButton>
        </FooterButton>
      </Footer>
    </ModalContent>
  </RegulationModal>)
}

const Body = styled.div`
  display: flex;
  flex-direction: column;
  overflow: scroll;
  box-sizing: border-box;
  width: 100%;
`

const Footer = styled.div`
  background-color: ${COLORS.background};
  border-top: 1px solid ${COLORS.lightGray};
`

const CloseIcon = styled(CloseIconSVG)`
  width: 16px;
  vertical-align: text-bottom;
  cursor: pointer;
  float: right;
`

const RegulationModal = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
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
  left: 33%;
  top: 33%;
  width: 400px;
  box-sizing: border-box;
  background-color: ${COLORS.background};
  overflow: hidden;
`

const ModalTitle = styled.div`
  background-color: ${COLORS.charcoal};
  text-align: center;
  padding: 9px;
  font-size:13px;
  color: ${COLORS.white};
`

const Section = styled.div`
  padding: 35px 42px;
  text-align: center;
`

export default RemoveRegulationModal
