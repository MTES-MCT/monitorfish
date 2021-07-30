import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import {
  resetModal,
  setIsModalOpen,
  setSelectedUpcomingRegulation
} from '../../../domain/reducers/Regulation'
import RegulatoryTextSection from './RegulatoryTextSection'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import { FooterButton } from '../../commonStyles/Backoffice.style'

import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'

const UpcomingRegulationModal = () => {
  const dispatch = useDispatch()
  const {
    isModalOpen,
    selectedUpcomingRegulation
  } = useSelector(state => state.regulation)

  const [regulatoryTextList, setRegulatoryTextList] = useState(selectedUpcomingRegulation.regulatoryText ? [...selectedUpcomingRegulation.regulatoryTextList] : [{}])

  const addUpcomingRegulation = () => {
    const newUpcomingRegulation = { ...selectedUpcomingRegulation }
    newUpcomingRegulation.regulatoryTextList = regulatoryTextList
    dispatch(setSelectedUpcomingRegulation(newUpcomingRegulation))
    dispatch(setIsModalOpen(false))
  }

  return (<RegulationModal isOpen={isModalOpen}>
    <ModalContent>
      <Body>
        <ModalTitle>
          BACKOFFISH - Ajouter une référence réglementaire à venir
          <CloseIcon onClick={() => dispatch(setIsModalOpen(false))}/>
        </ModalTitle>
        <Section>
          <RegulatoryTextSection
            regulatoryTextList={regulatoryTextList}
            setRegulatoryTextList={setRegulatoryTextList}
            source={'upcomingRegulation'}
          />
        </Section>
      </Body>
      <Footer>
      <FooterButton>
        <ValidateButton
          disabled={false}
          isLast={false}
          onClick={() => addUpcomingRegulation()}
        >
          Ajouter la réglementation à venir
        </ValidateButton>
        <CancelButton
          disabled={false}
          isLast={false}
          onClick={() => dispatch(resetModal())}
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
  overflow-y: scroll;
  height: calc(100vh - 260px);
`

const Footer = styled.div`
  background-color: ${COLORS.background};
  border-top: 1px solid ${COLORS.newGray};
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
  margin: 100px 160px;
  background-color: ${COLORS.background};
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

export default UpcomingRegulationModal
