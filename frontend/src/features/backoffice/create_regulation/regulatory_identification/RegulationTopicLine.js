import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { ContentLine, InfoText } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import Tag from '../Tag'
import MenuItem from '../custom_form/MenuItem'
import CreateRegulationTopicForm from './CreateRegulationTopicForm'
import InfoBox from '../InfoBox'
import { INFO_TEXT } from '../../../../constants/constants'
import { LAWTYPES_TO_TERRITORY } from '../../../../domain/entities/regulatory'
import updateLayerNameForAllZones from '../../../../domain/use_cases/updateLayerNameForAllZones'
import { formatDataForSelectPicker } from '../../../../utils'

const RegulationTopicLine = props => {
  const {
    disabled,
    selectedRegulationTopic,
    setSelectedRegulationTopic,
    regulationTopicIsMissing,
    selectedRegulationLawType
  } = props

  const {
    regulatoryTopics
  } = useSelector(state => state.regulatory)

  useEffect(() => {
    console.log('regulatoryTopics has changed?')
    console.log(regulatoryTopics)
    if (regulatoryTopics) {
      setLayerTypeList(formatDataForSelectPicker(regulatoryTopics))
    }
  }, [regulatoryTopics])

  const [layerTypeList, setLayerTypeList] = useState()
  const [isAddTopicClicked, setIsAddTopicClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)
  const [isEditLayerName, setIsEditLayerName] = useState(false)

  const dispatch = useDispatch()

  const updateLayerName = (newLayerName) => {
    // let newRegulatoryTopics = [...regulatoryTopics]
    if (isEditLayerName) {
      // newRegulatoryTopics = newRegulatoryTopics.filter(topic => topic !== selectedRegulationTopic)
      dispatch(updateLayerNameForAllZones(LAWTYPES_TO_TERRITORY[selectedRegulationLawType], selectedRegulationLawType, selectedRegulationTopic, newLayerName))
    }
    // newRegulatoryTopics.push(newLayerName)
    // newRegulatoryTopics.sort()
    // dispatch(setRegulatoryTopics(newRegulatoryTopics))
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
          disabled={disabled && layerTypeList}
          searchable={true}
          menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
          placeholder='Choisir une thématique'
          value={'Choisir une thématique'}
          onChange={setSelectedRegulationTopic}
          data={layerTypeList}
          renderMenuItem={(_, item) => <MenuItem checked={item.value === selectedRegulationTopic} item={item} tag={'Radio'} />}
          valueIsMissing={regulationTopicIsMissing}
        />
        {selectedRegulationTopic && !(isEditLayerName || isAddTopicClicked) &&
          <Tag
            data-cy={`${selectedRegulationTopic}`}
            tagValue={selectedRegulationTopic}
            onCloseIconClicked={_ => setSelectedRegulationTopic()}
            onClickText={_ => {
              setIsEditLayerName(true)
              setIsAddTopicClicked(true)
              setIsInfoTextShown(true)
            }}
          />}
        {
        isAddTopicClicked
          ? <CreateRegulationTopicForm
              selectedRegulationTopic={isEditLayerName ? selectedRegulationTopic : undefined}
              updateLayerName={updateLayerName}
              onCancelEdit={_ => {
                setIsAddTopicClicked(false)
                setIsInfoTextShown(false)
                setIsEditLayerName(false)
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
        {isEditLayerName
          ? <InfoText bold red>{INFO_TEXT.editLayerNamePart1}</InfoText>
          : <InfoText bold>{INFO_TEXT.layerNamePart1}</InfoText>}
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
