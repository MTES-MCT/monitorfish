import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'

import { DEFAULT_MENU_CLASSNAME, REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulatory'
import { formatDataForSelectPicker } from '../../../../utils'
import { ContentLine, InfoText, InfoTextWrapper } from '../../../commonStyles/Backoffice.style'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import { Label } from '../../../commonStyles/Input.style'
import { INFO_TEXT } from '../../constants'
import { updateProcessingRegulationByKey } from '../../Regulation.slice'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import InfoBox from '../InfoBox'
import Tag from '../Tag'
import CreateRegulationTopicForm from './CreateRegulationTopicForm'

function RegulationTopicLine(props) {
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
    <ContentLine disabled={disabled} isFormOpened={isAddTopicClicked} isInfoTextShown={isInfoTextShown}>
      <Wrapper>
        <Label>Thématique de la zone</Label>
        <CustomSelectComponent
          data={layerTypeList}
          disabled={disabled || isAddTopicClicked}
          emptyMessage="aucune thématique à afficher"
          menuClassName={DEFAULT_MENU_CLASSNAME}
          menuStyle={{ overflowY: 'hidden', textOverflow: 'ellipsis', width: 250 }}
          onChange={updateTopic}
          placeholder="Choisir une thématique"
          renderMenuItem={(_, item) => <MenuItem checked={item.value === topic} item={item} tag="Radio" />}
          searchable
          value="Choisir une thématique"
          valueIsMissing={regulationTopicIsMissing}
        />
        {topic && !isAddTopicClicked && (
          <Tag data-cy={`${topic}`} onCloseIconClicked={_ => updateTopic()} tagValue={topic} />
        )}
        {isAddTopicClicked ? (
          <CreateRegulationTopicForm
            onCancelEdit={_ => {
              setIsAddTopicClicked(false)
              setIsInfoTextShown(false)
            }}
            updateTopic={updateTopic}
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

export default RegulationTopicLine
