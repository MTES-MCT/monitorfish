import React from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../../constants/constants'
import { Section, SectionTitle } from '../../commonStyles/Backoffice.style'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import RegulatoryText from './RegulatoryText'
import UpcommingRegulationSection from './UpcommingRegulationSection'
import { setIsModalOpen } from '../Regulation.slice'
import { REGULATORY_TEXT_SOURCE, DEFAULT_REGULATORY_TEXT } from '../../../domain/entities/regulatory'

/**
 * @typedef {object} Props
 * @prop {[RegulatoryText]} regulatoryTextList
 * @prop {Function} setRegulatoryTextList
 * @prop {RegulatoryTextSource} source
 * @prop {Boolean} saveForm
 */
const RegulatoryTextSection = props => {
  const {
    regulatoryTextList,
    source,
    setRegulatoryTextList,
    saveForm
  } = props

  const { upcomingRegulation } = useSelector(state => state.regulation)

  const dispatch = useDispatch()

  const addOrRemoveRegulatoryTextInList = (id) => {
    let newRegulatoryTextList = [...regulatoryTextList]
    if (id === undefined) {
      newRegulatoryTextList.push(DEFAULT_REGULATORY_TEXT)
    } else if (regulatoryTextList.length === 1) {
      newRegulatoryTextList = [DEFAULT_REGULATORY_TEXT]
    } else {
      newRegulatoryTextList.splice(id, 1)
    }
    setRegulatoryTextList(newRegulatoryTextList)
  }

  const addRegRefInEffect = () => {
    addOrRemoveRegulatoryTextInList()
  }

  const addUpcomingText = () => {
    if (source === REGULATORY_TEXT_SOURCE.UPCOMING_REGULATION) {
      addOrRemoveRegulatoryTextInList()
    } else {
      dispatch(setIsModalOpen(true))
    }
  }

  const setRegulatoryText = (id, regulatoryText) => {
    const newRegulatoryTextList = [...regulatoryTextList]
    newRegulatoryTextList[id] = regulatoryText
    setRegulatoryTextList(newRegulatoryTextList)
  }

  return (<Section>
    <SectionTitle>
      {source === REGULATORY_TEXT_SOURCE.UPCOMING_REGULATION
        ? 'références réglementaires À VENIR'
        : 'références réglementaires en vigueur'}
    </SectionTitle>
    {
      (regulatoryTextList && regulatoryTextList.length > 0) &&
        regulatoryTextList.map((regulatoryText, id) => {
          return <RegulatoryText
              key={id}
              id={id}
              regulatoryText={regulatoryText}
              addOrRemoveRegulatoryTextInList={addOrRemoveRegulatoryTextInList}
              source={source}
              listLength={regulatoryTextList.length}
              saveForm={saveForm}
              setRegulatoryText={setRegulatoryText}
            />
        })
    }
    <ButtonLine>
    {source === REGULATORY_TEXT_SOURCE.REGULATION
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
    {source === REGULATORY_TEXT_SOURCE.REGULATION &&
      upcomingRegulation && upcomingRegulation !== {} &&
        <UpcommingRegulationSection upcomingRegulation={upcomingRegulation} />
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
