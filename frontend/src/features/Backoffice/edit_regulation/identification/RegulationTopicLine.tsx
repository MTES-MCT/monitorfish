import { INFO_TEXT } from '@features/Backoffice/constants'
import InfoBox from '@features/Backoffice/edit_regulation/InfoBox'
import { formatDataForSelectPicker } from '@features/Backoffice/utils'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Select, SingleTag } from '@mtes-mct/monitor-ui'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { CreateRegulationTopicForm } from './CreateRegulationTopicForm'
import { ContentLine, InfoText, InfoTextWrapper } from '../../../commonStyles/Backoffice.style'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import { Label } from '../../../commonStyles/Input.style'
import { DEFAULT_MENU_CLASSNAME, REGULATORY_REFERENCE_KEYS } from '../../../Regulation/utils'
import { updateProcessingRegulationByKey } from '../../slice'

import type { Option } from '@mtes-mct/monitor-ui'

export function RegulationTopicLine({ isDisabled }) {
  const dispatch = useBackofficeAppDispatch()
  const regulatoryTopics = useBackofficeAppSelector(state => state.regulatory.regulatoryTopics)
  const { topic } = useBackofficeAppSelector(state => state.regulation.processingRegulation)

  const [layerTypeList, setLayerTypeList] = useState<Option[]>([])
  const [isAddTopicClicked, setIsAddTopicClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)

  useEffect(() => {
    if (regulatoryTopics) {
      setLayerTypeList(formatDataForSelectPicker([...regulatoryTopics].sort()))
    }
  }, [regulatoryTopics])

  const updateTopic = async (value?) => {
    await dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.TOPIC, value }))
  }

  return (
    <ContentLine isFormOpened={isAddTopicClicked} isInfoTextShown={isInfoTextShown}>
      <Wrapper>
        <Label>Thématique de la zone</Label>
        <StyledSelect
          key={JSON.stringify(layerTypeList)}
          disabled={isDisabled || isAddTopicClicked}
          error={topic ? undefined : 'Thématique requise.'}
          isErrorMessageHidden
          isLabelHidden
          label="Choisir une thématique"
          menuClassName={DEFAULT_MENU_CLASSNAME}
          menuStyle={{ overflowY: 'hidden', textOverflow: 'ellipsis', width: 250 }}
          name="Choisir une thématique"
          onChange={updateTopic}
          options={layerTypeList}
          searchable
          value="Choisir une thématique"
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
            <InfoText bold>{INFO_TEXT.TOPIC}</InfoText>
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
