import React from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { COLORS } from '../../../constants/constants'
import { Section, SectionTitle } from '../../commonStyles/Backoffice.style'
import { ValidateButton, CancelButton } from '../../commonStyles/Buttons.style'
import RegulatoryText from '../RegulatoryText'
import UpcommingRegulationSection from './UpcommingRegulationSection'
import { addTextToRegulatoryTextList } from '../../../utils'

import {
  openModal
} from '../../../domain/reducers/Regulation'

/**
 * @typedef {object} Props
 * @prop {[RegulatoryText]} regulatoryTextList
 * @prop {[UpcomingRegulation]} upcomingRegulationList
 * @prop {Function} setRegulatoryTextList
 * @prop {'regulation' | 'upcomingRegulation'} source
 */
const RegulatoryTextSection = props => {
  const {
    regulatoryTextList,
    setRegulatoryTextList,
    upcomingRegulation,
    source
  } = props
  const dispatch = useDispatch()

  const addRegRefInEffect = () => {
    updateRegulatoryTextList()
  }

  const addUpcomingText = () => {
    if (source === 'upcomingRegulation') {
      updateRegulatoryTextList()
    } else {
      dispatch(openModal(-1))
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
              updateRegulatoryText={updateRegulatoryTextList}
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
        <UpcommingRegulationSection upcomingRegulationTextList={upcomingRegulation.regulatoryTextList} />
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
