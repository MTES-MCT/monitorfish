import React, { useState } from 'react'
import styled from 'styled-components'
import { CancelButton, ValidateButton } from '../../../commonStyles/Buttons.style'
import { CustomInput } from '../../../commonStyles/Input.style'

const CreateRegulationTopicForm = props => {
  const {
    onCancelEdit,
    updateTopic
  } = props
  const [topicPlace, setTopicPlace] = useState('')
  const [topicPlaceIsRed, setTopicPlaceIsRed] = useState(false)
  const [topicGears, setTopicGears] = useState('')
  const [topicSpecies, setTopicSpecies] = useState('')
  const [topicOtherIndications, setTopicOtherIndications] = useState('')

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
      const regulationTopic = `${topicPlace}
        ${topicSpecies ? ' - ' + topicSpecies : ''}
        ${topicGears ? ' - ' + topicGears : ''}
        ${topicOtherIndications ? ' - ' + topicOtherIndications : ''}`
      updateTopic(regulationTopic)
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
        $isRed={topicPlaceIsRed}
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
