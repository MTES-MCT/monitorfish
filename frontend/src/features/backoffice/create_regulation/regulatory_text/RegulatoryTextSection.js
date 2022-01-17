import React, { useCallback } from 'react'
import styled from 'styled-components'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../../../constants/constants'
import { Title, Section } from '../../../commonStyles/Backoffice.style'
import { ValidateButton, CancelButton } from '../../../commonStyles/Buttons.style'
import RegulatoryText from './RegulatoryText'
import UpcomingRegulationSection from './UpcomingRegulationSection'
import { setIsModalOpen, setUpcomingRegulatoryText } from '../../Regulation.slice'
import { REGULATORY_TEXT_SOURCE, DEFAULT_REGULATORY_TEXT } from '../../../../domain/entities/regulatory'

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
    setRegulatoryTextList,
    source,
    saveForm
  } = props

  const { currentRegulation } = useSelector(state => state.regulation)

  const { upcomingRegulatoryReferences } = currentRegulation

  const dispatch = useDispatch()

  const addOrRemoveRegulatoryTextInList = useCallback((id) => {
    let newRegulatoryTextList = regulatoryTextList ? [...regulatoryTextList] : []
    if (id === undefined) {
      newRegulatoryTextList.push(DEFAULT_REGULATORY_TEXT)
    } else if (regulatoryTextList.length === 1) {
      newRegulatoryTextList = [DEFAULT_REGULATORY_TEXT]
    } else {
      newRegulatoryTextList.splice(id, 1)
    }
    setRegulatoryTextList(newRegulatoryTextList)
  }, [setRegulatoryTextList, regulatoryTextList])

  const addRegRefInEffect = useCallback(() => {
    addOrRemoveRegulatoryTextInList()
  }, [addOrRemoveRegulatoryTextInList])

  const addUpcomingText = useCallback(() => {
    if (source === REGULATORY_TEXT_SOURCE.UPCOMING_REGULATION) {
      addOrRemoveRegulatoryTextInList()
    } else {
      dispatch(setIsModalOpen(true))
      dispatch(setUpcomingRegulatoryText(upcomingRegulatoryReferences.regulatoryTextList))
    }
  }, [addOrRemoveRegulatoryTextInList, setIsModalOpen])

  const setRegulatoryText = useCallback((id, regulatoryText) => {
    console.log('setRegulatoryText')
    console.log(regulatoryTextList)
    console.log(regulatoryText)
    const newRegulatoryTextList = regulatoryTextList ? [...regulatoryTextList] : []
    newRegulatoryTextList[id] = regulatoryText
    setRegulatoryTextList(newRegulatoryTextList)
  }, [setRegulatoryTextList, regulatoryTextList])

  return <Section show>
    <Title>
      {source === REGULATORY_TEXT_SOURCE.UPCOMING_REGULATION
        ? 'références réglementaires À VENIR'
        : 'références réglementaires en vigueur'}
    </Title>
    {
      (regulatoryTextList && regulatoryTextList.length > 0)
        ? regulatoryTextList.map((regulatoryText, id) => {
          return <RegulatoryText
              key={regulatoryText}
              id={id}
              regulatoryText={regulatoryText}
              addOrRemoveRegulatoryTextInList={addOrRemoveRegulatoryTextInList}
              source={source}
              listLength={regulatoryTextList.length}
              saveForm={saveForm}
              setRegulatoryText={setRegulatoryText}
            />
        })
        : <RegulatoryText
          regulatoryText={DEFAULT_REGULATORY_TEXT}
          key={-1}
          id={0}
          addOrRemoveRegulatoryTextInList={addOrRemoveRegulatoryTextInList}
          source={source}
          listLength={0}
          saveForm={saveForm}
          setRegulatoryText={setRegulatoryText}
        />
    }
    <ButtonLine>
    {source === REGULATORY_TEXT_SOURCE.REGULATION
      ? <><ValidateButton
        disabled={false}
        isLast={false}
        onClick={addRegRefInEffect}>
        Ajouter un autre texte en vigueur
      </ValidateButton>
      {upcomingRegulatoryReferences?.regulatoryTextList?.length === 0 && <CustomCancelButton
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
      upcomingRegulatoryReferences &&
        <UpcomingRegulationSection upcomingRegulation={upcomingRegulatoryReferences} />
    }
  </Section>
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
