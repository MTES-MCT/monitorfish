import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { CancelButton, ValidateButton } from '../../../commonStyles/Buttons.style'
import { CustomInput } from '../../../commonStyles/Input.style'

const CreateRegulationTopicForm = props => {
  const {
    selectedRegulationTopic,
    updateLayerName,
    onCancelEdit
  } = props
  const [topicPlace, setTopicPlace] = useState('')
  const [topicPlaceIsRed, setTopicPlaceIsRed] = useState(false)
  const [topicGears, setTopicGears] = useState('')
  const [topicSpecies, setTopicSpecies] = useState('')
  const [topicOtherIndications, setTopicOtherIndications] = useState('')

  useEffect(() => {
    if (selectedRegulationTopic) {
      initForm()
    }
  }, [selectedRegulationTopic])

  const initForm = () => {
    const themeSplitted = selectedRegulationTopic.split(' - ')
    setTopicPlace(themeSplitted[0])
    setTopicGears(themeSplitted[1])
    setTopicSpecies(themeSplitted[2])
    setTopicOtherIndications(themeSplitted[3])
  }

  const resetThemeForm = () => {
    setTopicPlace('')
    setTopicGears('')
    setTopicSpecies('')
    setTopicOtherIndications('')
  }

  const addNewTopic = () => {
    if (topicPlace === '') {
      setTopicPlaceIsRed(true)
    } else {
      const regulationLayerName = `${topicPlace}
        ${topicSpecies ? ' - ' + topicSpecies : ''}
        ${topicGears ? ' - ' + topicGears : ''}
        ${topicOtherIndications ? ' - ' + topicOtherIndications : ''}`
      updateLayerName(regulationLayerName)
      resetThemeForm()
      onCancelEdit()
      setTopicPlaceIsRed(false)
    }
  }
  return (
    <CreateRegulationBloc>
      <CustomInput
        placeholder='Lieu *'
        value={topicPlace}
        onChange={setTopicPlace}
        isRed={topicPlaceIsRed}
      />
      <CustomInput
        placeholder='Espèce'
        value={topicSpecies}
        onChange={setTopicSpecies}
      />
      <CustomInput
        placeholder='Engins'
        value={topicGears}
        onChange={setTopicGears}
      />
      <CustomInput
        placeholder='Autres indications'
        value={topicOtherIndications}
        onChange={setTopicOtherIndications}
        width={'115px'}
      />
      <ValidateButton
        disabled={false}
        isLast={false}
        onClick={addNewTopic}>
        Enregistrer
      </ValidateButton>
      <CancelButton
        disabled={false}
        isLast={false}
        onClick={onCancelEdit}
      >
        Annuler
      </CancelButton>
    </CreateRegulationBloc>
  )
}

const CreateRegulationBloc = styled.div`
  display: flex;
`

export default CreateRegulationTopicForm
