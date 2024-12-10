import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Select, SingleTag } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { CreateRegulationTopicForm } from './CreateRegulationTopicForm'
import { ContentLine, InfoText, InfoTextWrapper } from '../../../../commonStyles/Backoffice.style'
import { SquareButton } from '../../../../commonStyles/Buttons.style'
import { Label } from '../../../../commonStyles/Input.style'
import { regulationActions } from '../../../slice'
import { REGULATORY_REFERENCE_KEYS } from '../../../utils'
import { INFO_TEXT } from '../../RegulationTables/constants'
import { formatDataForSelectPicker } from '../../RegulationTables/utils'
import { InfoBox } from '../InfoBox'

import type { Option } from '@mtes-mct/monitor-ui'

export function RegulationTopicLine({ isDisabled }) {
  const dispatch = useBackofficeAppDispatch()
  const regulatoryTopics = useBackofficeAppSelector(state => state.regulation.regulatoryTopics)
  const topic = useBackofficeAppSelector(state => state.regulation.processingRegulation?.topic)

  const [layerTypeList, setLayerTypeList] = useState<Option[]>([])
  const [isAddTopicClicked, setIsAddTopicClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)

  useEffect(() => {
    if (regulatoryTopics) {
      setLayerTypeList(formatDataForSelectPicker([...regulatoryTopics].sort((a, b) => a.localeCompare(b))))
    }
  }, [regulatoryTopics])

  const updateTopic = async (value?) => {
    await dispatch(regulationActions.updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.TOPIC, value }))
  }

  return (
    <ContentLine $isFormOpened={isAddTopicClicked} $isInfoTextShown={isInfoTextShown}>
      <Wrapper>
        <Label>Thématique de la zone</Label>
        <StyledSelect
          key={JSON.stringify(layerTypeList)}
          disabled={isDisabled || isAddTopicClicked}
          error={topic ? undefined : 'Thématique requise.'}
          isErrorMessageHidden
          isLabelHidden
          label="Choisir une thématique"
          name="Choisir une thématique"
          onChange={updateTopic}
          options={layerTypeList}
          placeholder="Choisir une thématique"
          searchable
        />
        {topic && !isAddTopicClicked && <StyledTag onDelete={updateTopic}>{topic as unknown as string}</StyledTag>}
        {isAddTopicClicked && (
          <CreateRegulationTopicForm
            onCancelEdit={() => {
              setIsAddTopicClicked(false)
              setIsInfoTextShown(false)
            }}
            updateTopic={updateTopic}
          />
        )}
        {!isAddTopicClicked && !topic && !isDisabled && (
          <>
            <SquareButton
              onClick={() => {
                setIsAddTopicClicked(true)
                setIsInfoTextShown(true)
              }}
            />
            <CustomLabel>Créer une nouvelle thématique</CustomLabel>
          </>
        )}
      </Wrapper>
      {!isDisabled && (
        <CustomInfoBox
          isFormOpened={isAddTopicClicked}
          isInfoTextShown={isInfoTextShown}
          pointer
          setIsInfoTextShown={setIsInfoTextShown}
        >
          <InfoTextWrapper>
            <InfoText $bold>{INFO_TEXT.TOPIC}</InfoText>
            <InfoText>{INFO_TEXT.TOPIC_NEXT}</InfoText>
          </InfoTextWrapper>
        </CustomInfoBox>
      )}
    </ContentLine>
  )
}

const CustomLabel = styled(Label)`
  margin-right: 8px;
`

const CustomInfoBox = styled(InfoBox)`
  ${props => (props.isFormOpened ? '' : 'margin-top: 2px')};
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

const StyledTag = styled(SingleTag)`
  margin-right: 8px;
`

const StyledSelect = styled(Select)`
  margin-right: 8px;
`
