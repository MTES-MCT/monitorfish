/*
<ContentLine>
            <Label>Secteur</Label>
            <SelectWrapper>
              <CustomSelectPicker
                style={selectPickerStyle}
                searchable={false}
                placeholder='Choisir une thématique'
                value={'Choisir une thématique'}
                onChange={setSelectedSeaFront}
                data={seaFrontList}
                renderMenuItem={(_, item) => renderMenuItem(item.value === selectedSeaFront, item, 'Radio')}
              />
            </SelectWrapper>
            {selectedSeaFront
              ? <CustomTag>
                  <SelectedValue>{selectedSeaFront}</SelectedValue>
                  <CloseIcon onClick={() => setSelectedSeaFront()}/>
                </CustomTag>
              : null }
          </ContentLine>
*/

export const RegulationThemeLine = props => {
  return null
}
