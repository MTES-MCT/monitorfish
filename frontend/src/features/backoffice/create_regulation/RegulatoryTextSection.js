import React from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../../constants/constants'
import { Section, SectionTitle } from '../../commonStyles/Backoffice.style'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import RegulatoryText from './RegulatoryText'
import UpcommingRegulationSection from './UpcommingRegulationSection'
import { addTextToRegulatoryTextList } from '../../../utils'
import { openModal } from '../../../domain/shared_slices/Regulation'

/**
 * @typedef {object} Props
 * @prop {[RegulatoryText]} regulatoryTextList
 * @prop {Function} setRegulatoryTextList
 * @prop {'regulation' | 'upcomingRegulation'} source
 */
const RegulatoryTextSection = props => {
  const {
    regulatoryTextList,
    setRegulatoryTextList,
    source,
    saveForm,
    setRegulatoryTextHasValueMissing
  } = props

  const { upcomingRegulation } = useSelector(state => state.regulation)

  const dispatch = useDispatch()

  const addRegRefInEffect = () => {
    updateRegulatoryTextList()
  }

  const addUpcomingText = () => {
    if (source === 'upcomingRegulation') {
      updateRegulatoryTextList()
    } else {
      dispatch(openModal())
    }
  }

  const updateRegulatoryTextList = (id, regulatoryText) => {
    const newRegulatoryTextList = addTextToRegulatoryTextList(regulatoryTextList, id, regulatoryText)
    setRegulatoryTextList(newRegulatoryTextList)
  }

  return (<Section>
    <SectionTitle>
      {source === 'upcomingRegulation' ? 'références réglementaires À VENIR' : 'références réglementaires en vigueur'}
    </SectionTitle>
    {
      (regulatoryTextList && regulatoryTextList.length > 0) &&
        regulatoryTextList.map((regulatoryText, id) => {
          return <RegulatoryText
              key={id}
              id={id}
              regulatoryText={regulatoryText}
              setRegulatoryTextList={setRegulatoryTextList}
              setRegulatoryTextHasValueMissing={setRegulatoryTextHasValueMissing}
              updateRegulatoryText={updateRegulatoryTextList}
              saveForm={saveForm}
            />
        })
    }
    <ButtonLine>
    {source === 'regulation'
      ? <><ValidateButton
        disabled={false}
        isLast={false}
        onClick={addRegRefInEffect}>
        Ajouter un autre texte en vigueur
      </ValidateButton>
      {!upcomingRegulation && <CustomCancelButton
        disabled={false}
        isLast={false}
        onClick={addUpcomingText}>
        Ajouter un texte à venir
      </CustomCancelButton>}</>
      : <ValidateButton
        disabled={false}
        isLast={false}
        onClick={addUpcomingText}>
        Ajouter un texte à venir
      </ValidateButton>}
    </ButtonLine>
    {source === 'regulation' &&
      upcomingRegulation &&
        <UpcommingRegulationSection />
    }
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

export default RegulatoryTextSection
