import React, { useState } from 'react'
import styled from 'styled-components'

import { CancelButton, ValidateButton } from '../../../commonStyles/Buttons.style'
import { CustomInput } from '../../../commonStyles/Input.style'

function CreateRegulationTopicForm(props) {
  const { onCancelEdit, updateTopic } = props
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
        ${topicSpecies ? ` - ${topicSpecies}` : ''}
        ${topicGears ? ` - ${topicGears}` : ''}
        ${topicOtherIndications ? ` - ${topicOtherIndications}` : ''}`
      updateTopic(regulationTopic)
      resetThemeForm()
      onCancelEdit()
      setTopicPlaceIsRed(false)
    }
  }

  return (
    <CreateRegulationBloc>
      <CustomInput $isRed={topicPlaceIsRed} onChange={setTopicPlace} placeholder="Lieu *" value={topicPlace} />
      <CustomInput onChange={setTopicSpecies} placeholder="Espèce" value={topicSpecies} />
      <CustomInput onChange={setTopicGears} placeholder="Engins" value={topicGears} />
      <CustomInput
        onChange={setTopicOtherIndications}
        placeholder="Autres indications"
        value={topicOtherIndications}
        width="115px"
      />
      <ValidateButton disabled={false} isLast={false} onClick={addNewTopic}>
        Enregistrer
      </ValidateButton>
      <CancelButton disabled={false} isLast={false} onClick={onCancelEdit}>
        Annuler
      </CancelButton>
    </CreateRegulationBloc>
  )
}

const CreateRegulationBloc = styled.div`
  display: flex;
`

export default CreateRegulationTopicForm
