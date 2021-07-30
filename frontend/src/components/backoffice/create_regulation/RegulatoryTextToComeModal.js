import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import {
  setIsModalOpen,
  setSelectedRegulatoryTextToCome
} from '../../../domain/shared_slices/Regulation'
import RegulationTextSection from './RegulatoryTextSection'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import { Footer, FooterButton } from '../../commonStyles/Backoffice.style'

import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'

const RegulatoryTextToComeModal = () => {
  const dispatch = useDispatch()
  const {
    isModalOpen,
    selectedRegulatoryTextToComeId,
    selectedRegulatoryTextToCome,
    selectedRegulation
  } = useSelector(state => state.regulation)

  const regulatoryTextToCome =
    selectedRegulation && selectedRegulation.regulatoryTextToCome.length > 0
      ? selectedRegulation.regulatoryTextToCome[selectedRegulatoryTextToComeId]
      : {}

  const [regulatoryTextList, setRegulatoryTextList] = useState(regulatoryTextToCome && regulatoryTextToCome.regulatoryText ? regulatoryTextToCome.regulatoryTextList : [{}])

  const addRegulatoryTextToCome = () => {
    const newRegulatoryTextToCome = { ...selectedRegulatoryTextToCome }
    newRegulatoryTextToCome.regulatoryTextList = regulatoryTextList
    dispatch(setSelectedRegulatoryTextToCome(newRegulatoryTextToCome))
    dispatch(setIsModalOpen(false))
  }

  return (<RegulationModal isOpen={isModalOpen}>
    <ModalContent>
      <ModalTitle>
        BACKOFFISH - Ajouter une référence réglementaire à venir
        <CloseIcon onClick={() => dispatch(setIsModalOpen(false))}/>
      </ModalTitle>
      <Section>
        <RegulationTextSection
          regulatoryTextList={regulatoryTextList}
          setRegulatoryTextList={setRegulatoryTextList}
          source={'regulatoryTextToCome'}
        />
      </Section>
      <CustomFooter>
      <FooterButton>
        <ValidateButton
          disabled={false}
          isLast={false}
          onClick={() => addRegulatoryTextToCome()}
        >
          Ajouter la réglementation à venir
        </ValidateButton>
        <CancelButton
          disabled={false}
          isLast={false}
          onClick={() => dispatch(setIsModalOpen(false))}
        >
          Annuler
        </CancelButton>
      </FooterButton>
    </CustomFooter>
    </ModalContent>
  </RegulationModal>)
}

const CustomFooter = styled(Footer)`
  bordor-top: 1px solid ${COLORS.newGray};
`

const CloseIcon = styled(CloseIconSVG)`
  width: 16px;
  vertical-align: text-bottom;
  cursor: pointer;
  float: right;
`

const RegulationModal = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  width: 100%;
  height: 100vh;
  z-index: 1000;
  background-color: rgba(59, 69, 89, 0.5);
  position: fixed;
  top: 0;
`

const ModalContent = styled.div`
  height: calc(100vh - 200px);
  margin: 100px 160px;
  background-color: ${COLORS.background};
  overflow-y: scroll;
`

const ModalTitle = styled.div`
  background-color: ${COLORS.modalBackground};
  text-align: center;
  padding: 9px;
  font-size:13px;
  color: ${COLORS.white};
`

const Section = styled.div`
  padding: 40px 60px;
`

export default RegulatoryTextToComeModal
