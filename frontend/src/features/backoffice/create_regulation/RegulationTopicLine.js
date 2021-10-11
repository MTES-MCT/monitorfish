import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label } from '../../commonStyles/Input.style'
import { SquareButton } from '../../commonStyles/Buttons.style'
import CustomSelectComponent from './CustomSelectComponent'
import Tag from './Tag'
import MenuItem from './MenuItem'
import CreateRegulationLawTypeForm from './CreateRegulationLawTypeForm'
import InfoBox from './InfoBox'

const RegulationTopicLine = props => {
  const {
    selectedRegulationTopic,
    setSelectedRegulationTopic,
    zoneThemeList,
    regulationTopicIsMissing
  } = props

  const [isAddThemeClicked, setIsAddThemeClicked] = useState(false)
  const [isInfoTextShown, setIsInfoTextShown] = useState(false)

  return <ContentLine
    isFormOpened={isAddThemeClicked}
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
            tagValue={selectedRegulationTopic}
            onCloseIconClicked={_ => setSelectedRegulationTopic()}
          />}
        {
        isAddThemeClicked
          ? <CreateRegulationLawTypeForm
              setSelectedRegulationTheme={setSelectedRegulationTopic}
              setIsAddThemeClicked={setIsAddThemeClicked}
              setIsInfoTextShown={setIsInfoTextShown}
            />
          : !selectedRegulationTopic && <><SquareButton
          onClick={() => {
            setIsAddThemeClicked(true)
            setIsInfoTextShown(true)
          }}
        />
        <CustomLabel >Créer une nouvelle thématique</CustomLabel></>
        }
      </Wrapper>
      <CustomInfoBox
        isInfoTextShown={isInfoTextShown}
        setIsInfoTextShown={setIsInfoTextShown}
        isFormOpened={isAddThemeClicked}
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
