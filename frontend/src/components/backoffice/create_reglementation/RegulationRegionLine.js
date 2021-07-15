/*
<ContentLine>
            <Label>Région</Label>
            <SelectWrapper>
              <CustomSelectPicker
                menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
                style={selectPickerStyle}
                searchable={false}
                placeholder='Choisir une région'
                onChange={addRegionToSelectedRegionList}
                value={'Choisir une région'}
                data={formatData(FRENCH_REGION_LIST)}
                renderMenuItem={(_, item) => renderMenuItem(selectedRegionList.includes(item.value), item, 'Checkbox')}
                block
              />
            </SelectWrapper>
            <>
            {
            selectedRegionList && selectedRegionList.length > 0 &&
              <SelectedRegionList />
            }
            </>
          </ContentLine>
*/

export const RegulationRegionLine = props => {
  return null
}
