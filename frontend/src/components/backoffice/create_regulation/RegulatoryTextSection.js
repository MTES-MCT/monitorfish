import React from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { COLORS } from '../../../constants/constants'
import { Section, SectionTitle } from '../../commonStyles/Backoffice.style'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import RegulatoryText from '../RegulatoryText'
import { addTextToRegulatoryTextList } from '../../../utils'

import {
  setIsModalOpen,
  setSelectedRegulatoryTextToComeId,
  setSelectedRegulatoryTextToCome
} from '../../../domain/shared_slices/Regulation'

/**
 * @typedef {object} Props
 * @prop {[RegulatoryText]} regulatoryTextList
 * @prop {[RegulatoryTextToCome]} regulatoryTextToComeList
 * @prop {Function} setRegulatoryTextList
 * @prop {'regulation' | 'regulatoryTextToCome'} source
 */
const RegulationTextSection = props => {
  const {
    regulatoryTextList,
    setRegulatoryTextList,
    regulatoryTextToComeList,
    source
  } = props
  const dispatch = useDispatch()

  const addRegRefInEffect = () => {
    updateRegulatoryTextList()
  }

  const addTextToCome = () => {
    if (source === 'regulatoryTextToCome') {
      updateRegulatoryTextList()
    } else {
      dispatch(setIsModalOpen(true))
      dispatch(setSelectedRegulatoryTextToComeId(-1))
      dispatch(setSelectedRegulatoryTextToCome({}))
    }
  }

  const updateRegulatoryTextList = (id, regulatoryText) => {
    const newRegulatoryTextList = addTextToRegulatoryTextList(regulatoryTextList, id, regulatoryText)
    setRegulatoryTextList(newRegulatoryTextList)
  }

  return (<Section>
    <SectionTitle>
      références réglementaires en vigueur
    </SectionTitle>
    {
      (regulatoryTextList && regulatoryTextList.length > 0) &&
        regulatoryTextList.map((regulatoryText, id) => {
          return <RegulatoryText
              key={id}
              id={id}
              regulatoryText={regulatoryText}
              setRegulatoryTextList={setRegulatoryTextList}
              updateRegulationText={updateRegulatoryTextList}
            />
        })
    }
    { regulatoryTextToComeList && <span>il y a {regulatoryTextToComeList.length} textes réglementaires à venir à afficher</span>}
    <ButtonLine>
      {source === 'regulation' && <ValidateButton
        disabled={false}
        isLast={false}
        onClick={addRegRefInEffect}>
        Ajouter un autre texte en vigueur
      </ValidateButton>}
      <CustomCancelButton
        disabled={false}
        isLast={false}
        onClick={addTextToCome}>
        Ajouter un texte à venir
      </CustomCancelButton>
    </ButtonLine>
  </Section>)
}

const CustomCancelButton = styled(CancelButton)`
  margin: 0px;
`

const ButtonLine = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${COLORS.background};
`

export default RegulationTextSection
