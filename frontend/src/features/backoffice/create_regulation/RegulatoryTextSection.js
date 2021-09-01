import React from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../../constants/constants'
import { Section, SectionTitle } from '../../commonStyles/Backoffice.style'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import RegulatoryText from './RegulatoryText'
import UpcommingRegulationSection from './UpcommingRegulationSection'
import { setIsModalOpen } from '../Regulation.slice'

/**
 * @typedef {object} Props
 * @prop {[RegulatoryText]} regulatoryTextList
 * @prop {Function} setRegulatoryTextList
 * @prop {'regulation' | 'upcomingRegulation'} source
 * @prop {Boolean} saveForm
 */
const RegulatoryTextSection = props => {
  const {
    regulatoryTextList,
    source,
    saveForm,
    setRegulatoryTextList
  } = props

  const { upcomingRegulation } = useSelector(state => state.regulation)

  const dispatch = useDispatch()

  const addNewRegulatoryTextInList = () => {
    const newRegulatoryTextList = [...regulatoryTextList]
    newRegulatoryTextList.push({})
    setRegulatoryTextList(newRegulatoryTextList)
  }

  const removeRegulatoryTextFromList = (id) => {
    const newRegulatoryTextList = [...regulatoryTextList]
    newRegulatoryTextList.splice(id, 1)
    setRegulatoryTextList(newRegulatoryTextList)
  }

  const addRegRefInEffect = () => {
    addNewRegulatoryTextInList()
  }

  const addUpcomingText = () => {
    if (source === 'upcomingRegulation') {
      addNewRegulatoryTextInList()
    } else {
      dispatch(setIsModalOpen(true))
    }
  }

  return (<Section>
    <SectionTitle>
      {source === 'upcomingRegulation' ? 'références réglementaires À VENIR' : 'références réglementaires en vigueur'}
    </SectionTitle>
    {
      (regulatoryTextList && regulatoryTextList.length > 0)
        ? regulatoryTextList.map((regulatoryText, id) => {
          return <RegulatoryText
              key={id}
              id={id}
              regulatoryText={regulatoryText}
              removeRegulatoryTextFromList={removeRegulatoryTextFromList}
              saveForm={saveForm}
            />
        })
        : <RegulatoryText
            key={0}
            id={0}
            regulatoryText={{}}
            removeRegulatoryTextFromList={removeRegulatoryTextFromList}
            saveForm={saveForm}
        />
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
