// import React from 'react'

const RegulationZoneThemeLine = props => {
/*
<ContentLine
isFormOpened={isAddThemeClicked}
isInfoTextShown={isInfoTextShown}
>
<Wrapper>
<Label>Thématique de la zone</Label>
<SelectWrapper>
<CustomSelectPicker
searchable={false}
style={selectPickerStyle}
menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
placeholder='Choisir une thématique'
value={'Choisir une thématique'}
onChange={setSelectedReglementationTheme}
data={zoneThemeList}
renderMenuItem={(_, item) => renderMenuItem(item.value === selectedReglementationTheme, item, 'Radio')}
/>
</SelectWrapper>
{selectedReglementationTheme
? <CustomTag>
<SelectedValue>{selectedReglementationTheme}</SelectedValue>
<CloseIcon onClick={() => setSelectedReglementationTheme()}/>
</CustomTag>
: null }
{
isAddThemeClicked
? <CreateReglementationBloc>
<CustomInput
placeholder='Lieu*'
value={themePlace}
onChange={setThemePlace}
isRed={themePlaceIsRed}
/>
<CustomInput
placeholder='Espèce'
value={themeSpecies}
onChange={setThemeSpecies}
/>
<CustomInput
placeholder='Engins'
value={themeGears}
onChange={setThemeGears}
/>
<CustomInput
placeholder='Autres indications'
value={themeOtherIndications}
onChange={setThemeOtherIndications}
width={'115px'}
/>
<ValidateButton
disabled={false}
isLast={false}
onClick={addNewTheme}>
Enregistrer
</ValidateButton>
<CancelButton
disabled={false}
isLast={false}
onClick={() => {
setIsAddThemeClicked(false)
setIsInfoTextShown(false)
}}
>
Annuler
</CancelButton>
</CreateReglementationBloc>
: !selectedReglementationTheme && <><RectangularButton
onClick={() => {
setIsAddThemeClicked(true)
setIsInfoTextShown(true)
}}
/>
<Label>Créer une nouvelle thématique</Label></>
}
</Wrapper>
{displayInfoBox(isInfoTextShown, setIsInfoTextShown, isAddThemeClicked, 'zoneTheme')}
</ContentLine>
*/
  return null
}

export default RegulationZoneThemeLine
