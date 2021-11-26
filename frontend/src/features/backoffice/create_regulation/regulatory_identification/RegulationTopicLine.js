import React, { useState } from 'react'
// import { useDispatch } from 'react-redux'
import styled from 'styled-components'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import { SquareButton } from '../../../commonStyles/Buttons.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import Tag from '../Tag'
import MenuItem from '../custom_form/MenuItem'
import CreateRegulationTopicForm from './CreateRegulationTopicForm'
import InfoBox from '../InfoBox'

const RegulationTopicLine = props => {
  const {
    selectedRegulationTopic,
    setSelectedRegulationTopic,
    zoneThemeList,
    regulationTopicIsMissing
    // selectedRegulationLawType
  } = props

  const [isAddTopicClicked, setIsAddTopicClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)

  // const dispatch = useDispatch()

  /* const onUpdateLayerName = () => {
    const newLayerName = 'update layer name'
    dispatch(updateLayerName(LAWTYPES_TO_TERRITORY[selectedRegulationLawType], selectedRegulationLawType, selectedRegulationTopic, newLayerName))
  } */

  return <ContentLine
    isFormOpened={isAddTopicClicked}
    isInfoTextShown={isInfoTextShown}
    >
      <Wrapper>
        <Label>Thématique de la zone</Label>
        <CustomSelectComponent
          searchable={true}
          menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
          placeholder='Choisir une thématique'
          value={'Choisir une thématique'}
          onChange={setSelectedRegulationTopic}
          data={zoneThemeList}
          renderMenuItem={(_, item) => <MenuItem checked={item.value === selectedRegulationTopic} item={item} tag={'Radio'} />}
          valueIsMissing={regulationTopicIsMissing}
        />
        {selectedRegulationTopic &&
          <Tag
            data-cy={`${selectedRegulationTopic}`}
            tagValue={selectedRegulationTopic}
            onCloseIconClicked={_ => setSelectedRegulationTopic()}
          />}
        {
        isAddTopicClicked
          ? <CreateRegulationTopicForm
              setSelectedRegulationTopic={setSelectedRegulationTopic}
              setIsAddTopicClicked={setIsAddTopicClicked}
              setIsInfoTextShown={setIsInfoTextShown}
            />
          : !selectedRegulationTopic && <><SquareButton
          onClick={() => {
            setIsAddTopicClicked(true)
            setIsInfoTextShown(true)
          }}
        />
        <CustomLabel >Créer une nouvelle thématique</CustomLabel></>
        }
      </Wrapper>
      <CustomInfoBox
        isInfoTextShown={isInfoTextShown}
        setIsInfoTextShown={setIsInfoTextShown}
        isFormOpened={isAddTopicClicked}
        message={'zoneTheme'}
      />
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
