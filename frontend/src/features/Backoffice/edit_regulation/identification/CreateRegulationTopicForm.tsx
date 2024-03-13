import { Accent, Button, TextInput } from '@mtes-mct/monitor-ui'
import { useState } from 'react'
import styled from 'styled-components'

export function CreateRegulationTopicForm({ onCancelEdit, updateTopic }) {
  const [topicPlace, setTopicPlace] = useState<string | undefined>('')
  const [topicPlaceError, setTopicPlaceError] = useState<string | undefined>(undefined)
  const [topicGears, setTopicGears] = useState<string | undefined>('')
  const [topicSpecies, setTopicSpecies] = useState<string | undefined>('')
  const [topicOtherIndications, setTopicOtherIndications] = useState<string | undefined>('')

  const resetThemeForm = () => {
    setTopicPlace('')
    setTopicGears('')
    setTopicSpecies('')
    setTopicOtherIndications('')
  }

  const addNewTopic = () => {
    if (topicPlace === '') {
      setTopicPlaceError('Le lieu est requis')
    } else {
      const regulationTopic = `${topicPlace}
        ${topicSpecies ? ` - ${topicSpecies}` : ''}
        ${topicGears ? ` - ${topicGears}` : ''}
        ${topicOtherIndications ? ` - ${topicOtherIndications}` : ''}`
      updateTopic(regulationTopic)
      resetThemeForm()
      onCancelEdit()
      setTopicPlaceError(undefined)
    }
  }

  return (
    <CreateRegulationBloc>
      <StyledTextInput
        error={topicPlaceError}
        isLabelHidden
        label="Lieu *"
        name="topicPlace"
        onChange={setTopicPlace}
        placeholder="Lieu *"
        value={topicPlace}
      />
      <StyledTextInput
        isLabelHidden
        label="Espèce"
        name="topicSpecies"
        onChange={setTopicSpecies}
        placeholder="Espèce"
        value={topicSpecies}
      />
      <StyledTextInput
        isLabelHidden
        label="Engins"
        name="topicGears"
        onChange={setTopicGears}
        placeholder="Engins"
        value={topicGears}
      />
      <StyledTextInput
        isLabelHidden
        label="Autres indications"
        name="topicOtherIndications"
        onChange={setTopicOtherIndications}
        placeholder="Autres indications"
        value={topicOtherIndications}
      />
      <Button accent={Accent.SECONDARY} onClick={addNewTopic}>
        Enregistrer
      </Button>
      <Button accent={Accent.TERTIARY} onClick={onCancelEdit}>
        Annuler
      </Button>
    </CreateRegulationBloc>
  )
}

const CreateRegulationBloc = styled.div`
  display: flex;
`

const StyledTextInput = styled(TextInput)`
  margin-right: 8px;
`
