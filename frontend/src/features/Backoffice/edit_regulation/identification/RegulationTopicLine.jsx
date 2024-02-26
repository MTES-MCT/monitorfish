import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import { ContentLine, InfoText, InfoTextWrapper } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import Tag from '../Tag'
import MenuItem from '../custom_form/MenuItem'
import CreateRegulationTopicForm from './CreateRegulationTopicForm'
import InfoBox from '../InfoBox'
import { INFO_TEXT } from '../../constants'
import { DEFAULT_MENU_CLASSNAME, REGULATORY_REFERENCE_KEYS } from '../../../Regulation/utils'
import { updateProcessingRegulationByKey } from '../../slice'
import { formatDataForSelectPicker } from '@features/Backoffice/utils'
const RegulationTopicLine = props => {
  const { disabled, regulationTopicIsMissing } = props

  const dispatch = useDispatch()

  const { regulatoryTopics } = useSelector(state => state.regulatory)

  const { topic } = useSelector(state => state.regulation.processingRegulation)

  useEffect(() => {
    if (regulatoryTopics) {
      setLayerTypeList(formatDataForSelectPicker([...regulatoryTopics].sort()))
    }
  }, [regulatoryTopics])

  const [layerTypeList, setLayerTypeList] = useState()
  const [isAddTopicClicked, setIsAddTopicClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)

  const updateTopic = value => {
    dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.TOPIC, value }))
  }

  return (
    <ContentLine isFormOpened={isAddTopicClicked} isInfoTextShown={isInfoTextShown} disabled={disabled}>
      <Wrapper>
        <Label>Thématique de la zone</Label>
        <CustomSelectComponent
          disabled={disabled || isAddTopicClicked}
          searchable={true}
          menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
          placeholder="Choisir une thématique"
          value={'Choisir une thématique'}
          onChange={updateTopic}
          data={layerTypeList}
          renderMenuItem={(_, item) => <MenuItem checked={item.value === topic} item={item} tag={'Radio'} />}
          valueIsMissing={regulationTopicIsMissing}
          emptyMessage={'aucune thématique à afficher'}
          menuClassName={DEFAULT_MENU_CLASSNAME}
        />
        {topic && !isAddTopicClicked && (
          <Tag data-cy={`${topic}`} tagValue={topic} onCloseIconClicked={_ => updateTopic()} />
        )}
        {isAddTopicClicked ? (
          <CreateRegulationTopicForm
            updateTopic={updateTopic}
            onCancelEdit={_ => {
              setIsAddTopicClicked(false)
              setIsInfoTextShown(false)
            }}
          />
        ) : (
          !topic &&
          !disabled && (
            <>
              <SquareButton
                onClick={() => {
                  setIsAddTopicClicked(true)
                  setIsInfoTextShown(true)
                }}
              />
              <CustomLabel>Créer une nouvelle thématique</CustomLabel>
            </>
          )
        )}
      </Wrapper>
      {!disabled && (
        <CustomInfoBox
          isInfoTextShown={isInfoTextShown}
          setIsInfoTextShown={setIsInfoTextShown}
          isFormOpened={isAddTopicClicked}
          pointer
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

export default RegulationTopicLine
