import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { ContentLine, InfoText } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import Tag from '../Tag'
import MenuItem from '../custom_form/MenuItem'
import CreateRegulationTopicForm from './CreateRegulationTopicForm'
import InfoBox from '../InfoBox'
import { INFO_TEXT } from '../../constants'
import { formatDataForSelectPicker } from '../../../../utils'
import { DEFAULT_MENU_CLASSNAME } from '../../../../domain/entities/regulatory'
const RegulationTopicLine = props => {
  const {
    disabled,
    selectedRegulationTopic,
    setSelectedRegulationTopic,
    regulationTopicIsMissing
  } = props

  const {
    regulatoryTopics
  } = useSelector(state => state.regulatory)

  useEffect(() => {
    if (regulatoryTopics) {
      setLayerTypeList(formatDataForSelectPicker([...regulatoryTopics].sort()))
    }
  }, [regulatoryTopics])

  const [layerTypeList, setLayerTypeList] = useState()
  const [isAddTopicClicked, setIsAddTopicClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)

  const updateLayerName = (newLayerName) => {
    setSelectedRegulationTopic(newLayerName)
  }

  return <ContentLine
    isFormOpened={isAddTopicClicked}
    isInfoTextShown={isInfoTextShown}
    disabled={disabled}
    >
      <Wrapper>
        <Label>Thématique de la zone</Label>
        <CustomSelectComponent
          disabled={disabled}
          searchable={true}
          menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
          placeholder='Choisir une thématique'
          value={'Choisir une thématique'}
          onChange={setSelectedRegulationTopic}
          data={layerTypeList}
          renderMenuItem={(_, item) => <MenuItem checked={item.value === selectedRegulationTopic} item={item} tag={'Radio'} />}
          valueIsMissing={regulationTopicIsMissing}
          emptyMessage={'aucune thématique à afficher'}
          menuClassName={DEFAULT_MENU_CLASSNAME}
        />
        {selectedRegulationTopic && !isAddTopicClicked &&
          <Tag
            data-cy={`${selectedRegulationTopic}`}
            tagValue={selectedRegulationTopic}
            onCloseIconClicked={_ => setSelectedRegulationTopic()}
          />}
        {
        isAddTopicClicked
          ? <CreateRegulationTopicForm
              updateLayerName={updateLayerName}
              onCancelEdit={_ => {
                setIsAddTopicClicked(false)
                setIsInfoTextShown(false)
              }}
            />
          : !selectedRegulationTopic && !disabled && <><SquareButton
              onClick={() => {
                setIsAddTopicClicked(true)
                setIsInfoTextShown(true)
              }}
            />
            <CustomLabel >Créer une nouvelle thématique</CustomLabel></>
        }
      </Wrapper>
      {!disabled && <CustomInfoBox
        isInfoTextShown={isInfoTextShown}
        setIsInfoTextShown={setIsInfoTextShown}
        isFormOpened={isAddTopicClicked}
        pointer
      >
        <InfoText bold>{INFO_TEXT.layerNamePart1}</InfoText>
        <InfoText >
          {INFO_TEXT.layerNamePart2}
        </InfoText>
      </CustomInfoBox>}
    </ContentLine>
}

const CustomLabel = styled(Label)` 
  margin-right: 8px;
`

const CustomInfoBox = styled(InfoBox)`
  ${props => props.isFormOpened ? '' : 'margin-top: 2px'};
`

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

export default RegulationTopicLine
