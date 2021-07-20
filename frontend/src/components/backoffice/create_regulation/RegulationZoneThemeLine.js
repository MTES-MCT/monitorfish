import React, { useState } from 'react'
import styled from 'styled-components'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label } from '../../commonStyles/Input.style'
import { SquareButton } from '../../commonStyles/Buttons.style'
import CustomSelectComponent from './CustomSelectComponent'
import Tag from './Tag'
import MenuItem from './MenuItem'
import CreateRegulationBlocForm from './CreateRegulationBlocForm'
import InfoBox from './InfoBox'

const RegulationZoneThemeLine = props => {
  const {
    selectedReglementationTheme,
    setSelectedReglementationTheme,
    zoneThemeList
  } = props

  const [isAddThemeClicked, setIsAddThemeClicked] = useState()
  const [isInfoTextShown, setIsInfoTextShown] = useState()

  return <ContentLine
    isFormOpened={isAddThemeClicked}
    isInfoTextShown={isInfoTextShown}
    >
      <Wrapper>
        <Label>Thématique de la zone</Label>
        <CustomSelectComponent
          searchable={false}
          menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
          placeholder='Choisir une thématique'
          value={'Choisir une thématique'}
          onChange={setSelectedReglementationTheme}
          data={zoneThemeList}
          renderMenuItem={(_, item) => <MenuItem checked={item.value === selectedReglementationTheme} item={item} tag={'Radio'} />}
        />
        {selectedReglementationTheme &&
          <Tag
            selectedValue={selectedReglementationTheme}
            onCloseIconClicked={_ => setSelectedReglementationTheme()}
          />}
        {
        isAddThemeClicked
          ? <CreateRegulationBlocForm
              setSelectedReglementationTheme={setSelectedReglementationTheme}
              setIsAddThemeClicked={setIsAddThemeClicked}
              setIsInfoTextShown={setIsInfoTextShown}
            />
          : !selectedReglementationTheme && <><SquareButton
          onClick={() => {
            setIsAddThemeClicked(true)
            setIsInfoTextShown(true)
          }}
        />
        <Label>Créer une nouvelle thématique</Label></>
        }
      </Wrapper>
      <InfoBox
        isInfoTextShown={isInfoTextShown}
        setIsInfoTextShown={setIsInfoTextShown}
        isFormOpened={isAddThemeClicked}
        message={'zoneTheme'}
      />
      </ContentLine>
}

const Wrapper = styled.div`
  display: flex;
  margin-bottom: 8px;
  align-items: center;
`

export default RegulationZoneThemeLine
