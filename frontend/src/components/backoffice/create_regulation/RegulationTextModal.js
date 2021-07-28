import React from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import RegulationTextSection from './RegulationTextSection'

const RegulationTextModal = props => {
  const { isModalOpen } = useSelector(state => state.regulatory)
  const {
    regulationTextToComeList,
    setRegulationTextToComeList
  } = props

  return (<RegulationModal isOpen={isModalOpen}>
    <ModalContent>
      <ModalTitle>BACKOFFISH - Ajouter une référence réglementaire à venir</ModalTitle>
      <Section>
        <RegulationTextSection
          regulationTextList={regulationTextToComeList}
          setRegulationTextList={setRegulationTextToComeList}
          isRefToCome={true}
        />
      </Section>
    </ModalContent>
  </RegulationModal>)
}

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
`

const ModalTitle = styled.div`
  background-color: ${COLORS.charcoal};
  text-align: center;
  padding: 9px;
  font-size:13px;
  color: ${COLORS.white};
`

const Section = styled.div`
  padding: 40px 60px;
`

export default RegulationTextModal
