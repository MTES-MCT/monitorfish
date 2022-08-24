import React from 'react'
import { useDispatch } from 'react-redux'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { DEFAULT_REGULATORY_TEXT, REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulatory'
import { Section, Title } from '../../../commonStyles/Backoffice.style'
import { ValidateButton } from '../../../commonStyles/Buttons.style'
import RegulatoryText from './RegulatoryText'
import { updateProcessingRegulationByKey } from '../../Regulation.slice'

/**
 * @typedef {object} Props
 * @prop {[RegulatoryText]} regulatoryTextList
 * @prop {Function} setRegulatoryTextList
 * @prop {RegulatoryTextSource} source
 * @prop {Boolean} saveForm
 */
function RegulatoryTextSection(props) {
  const { regulatoryTextList, source, saveForm } = props
  const dispatch = useDispatch()

  const setRegulatoryTextList = texts =>
    dispatch(
      updateProcessingRegulationByKey({
        key: REGULATORY_REFERENCE_KEYS.REGULATORY_REFERENCES,
        value: texts,
      }),
    )

  const addOrRemoveRegulatoryTextInList = id => {
    let newRegulatoryTextList = regulatoryTextList ? [...regulatoryTextList] : []

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

  const setRegulatoryText = (id, regulatoryText) => {
    const newRegulatoryTextList = regulatoryTextList ? [...regulatoryTextList] : []
    newRegulatoryTextList[id] = regulatoryText
    setRegulatoryTextList(newRegulatoryTextList)
  }

  return (
    <Section show>
      <Title>références réglementaires en vigueur</Title>
      {regulatoryTextList && regulatoryTextList.length > 0 ? (
        regulatoryTextList.map((regulatoryText, id) => <RegulatoryText
              key={regulatoryText}
              id={id}
              regulatoryText={regulatoryText}
              addOrRemoveRegulatoryTextInList={addOrRemoveRegulatoryTextInList}
              source={source}
              listLength={regulatoryTextList.length}
              saveForm={saveForm}
              setRegulatoryText={setRegulatoryText}
            />)
        })
      ) : (
        <RegulatoryText
          key={0}
          addOrRemoveRegulatoryTextInList={addOrRemoveRegulatoryTextInList}
          id={0}
          listLength={0}
          regulatoryText={DEFAULT_REGULATORY_TEXT}
          saveForm={saveForm}
          setRegulatoryText={setRegulatoryText}
          source={source}
        />
      )}
      <ButtonLine>
        <ValidateButton disabled={false} isLast={false} onClick={addRegRefInEffect}>
          Ajouter un autre texte en vigueur
        </ValidateButton>
      </ButtonLine>
    </Section>
  )
}

const ButtonLine = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${COLORS.background};
`

export default RegulatoryTextSection
