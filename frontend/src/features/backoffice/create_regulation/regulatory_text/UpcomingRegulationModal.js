import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch, batch } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import {
  setIsModalOpen,
  setUpcomingRegulatoryTextListCheckedMap,
  setSaveUpcomingRegulation,
  setUpcomingRegulatoryText,
  setRegulationByKey
} from '../../Regulation.slice'
import RegulatoryTextSection from './RegulatoryTextSection'
import { ValidateButton, CancelButton } from '../../../commonStyles/Buttons.style'
import { FooterButton } from '../../../commonStyles/Backoffice.style'
import { ReactComponent as CloseIconSVG } from '../../../icons/Croix_grise_clair.svg'
import {
  REGULATORY_TEXT_SOURCE,
  INITIAL_UPCOMING_REG_REFERENCE,
  REGULATORY_REFERENCE_KEYS
} from '../../../../domain/entities/regulatory'

const UpcomingRegulationModal = () => {
  const dispatch = useDispatch()
  const {
    isModalOpen,
    upcomingRegulatoryTextCheckedMap,
    saveUpcomingRegulation,
    upcomingRegulatoryText
  } = useSelector(state => state.regulation)

  const onAddUpcomingRegulation = () => {
    dispatch(setSaveUpcomingRegulation(true))
  }

  const setRegulatoryTextList = useCallback((regulatoryTextList) => {
    dispatch(setUpcomingRegulatoryText({ regulatoryTextList }))
  }, [setRegulationByKey])

  useEffect(() => {
    if (upcomingRegulatoryTextCheckedMap) {
      const regulatoryTextCheckList = Object.values(upcomingRegulatoryTextCheckedMap)
      const allTextsHaveBeenChecked = regulatoryTextCheckList.length > 0 &&
        regulatoryTextCheckList.length === upcomingRegulatoryText.regulatoryTextList.length
      if (allTextsHaveBeenChecked) {
        const allTextsHaveBeenFilled = !regulatoryTextCheckList.includes(false)
        if (allTextsHaveBeenFilled) {
          const newUpcomingRegulation = { ...(upcomingRegulatoryText || { regulatoryTextList: [] }) }
          newUpcomingRegulation.regulatoryTextList = [...upcomingRegulatoryText.regulatoryTextList]
          batch(() => {
            dispatch(setRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.UPCOMING_REGULATORY_REFERENCES, value: newUpcomingRegulation }))
            dispatch(setIsModalOpen(false))
          })
        }
        batch(() => {
          dispatch(setUpcomingRegulatoryTextListCheckedMap({}))
          dispatch(setSaveUpcomingRegulation(false))
        })
      }
    }
  }, [saveUpcomingRegulation, upcomingRegulatoryTextCheckedMap])

  return (<RegulationModal isOpen={isModalOpen}>
    <ModalContent>
      <Body>
        <ModalTitle>
          BACKOFFISH - Ajouter une réglementation à venir
          <CloseIcon onClick={() => dispatch(setIsModalOpen(false))}/>
        </ModalTitle>
        <Section>
          <RegulatoryTextSection
            regulatoryTextList={upcomingRegulatoryText.regulatoryTextList}
            setRegulatoryTextList={setRegulatoryTextList}
            source={REGULATORY_TEXT_SOURCE.UPCOMING_REGULATION}
            saveForm={saveUpcomingRegulation}
          />
        </Section>
      </Body>
      <Footer>
        <FooterButton>
          <ValidateButton
            disabled={false}
            isLast={false}
            onClick={onAddUpcomingRegulation}
          >
            Ajouter la réglementation à venir
          </ValidateButton>
          <CancelButton
            disabled={false}
            isLast={false}
            onClick={() => {
              dispatch(setUpcomingRegulatoryText(INITIAL_UPCOMING_REG_REFERENCE))
              dispatch(setIsModalOpen(false))
            }}
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
  height: calc(100vh - 260px);
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
  box-sizing: border-box;
  margin: 100px 160px;
  background-color: ${COLORS.background};
  overflow: hidden;
  height: calc(100vh - 160px);
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

export default UpcomingRegulationModal
