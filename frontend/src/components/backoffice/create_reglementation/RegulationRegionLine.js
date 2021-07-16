import React, { useState } from 'react'
import {
  ContentLine,
  Label
} from '../common_styles'
import CustomSelectComponent from './CustomSelectComponent'
import { formatData, FRENCH_REGION_LIST } from '../utils'
import Tag from '../Tag'
import MenuItem from '../MenuItem'
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

const RegulationRegionLine = () => {
  const [selectedRegionList, setSelectedRegionList] = useState([])

  const addRegionToSelectedRegionList = (elem) => {
    const newArray = [...selectedRegionList]
    newArray.push(elem)
    setSelectedRegionList(newArray)
  }

  const removeRegionToSelectedRegionList = (elem) => {
    const idx = selectedRegionList.find(e => elem === e)
    const newArray = [...selectedRegionList]
    newArray.splice(idx, 1)
    setSelectedRegionList(newArray)
  }

  function SelectedRegionList () {
    return selectedRegionList.map(selectedRegion => {
      return <Tag
        key={selectedRegion}
        selectedValue={selectedRegion}
        setSelectedValue={removeRegionToSelectedRegionList}
      />
    })
  }

  return (<ContentLine>
    <Label>Région</Label>
    <CustomSelectComponent
      menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
      searchable={false}
      placeholder={'Choisir une région'}
      onChange={addRegionToSelectedRegionList}
      value={'Choisir une région'}
      data={formatData(FRENCH_REGION_LIST)}
      renderMenuItem={(_, item) => <MenuItem checked={selectedRegionList.includes(item.value)} item={item} tag={'Checkbox'} />}
    />
    <>
    {
    selectedRegionList && selectedRegionList.length > 0 &&
      <SelectedRegionList />
    }
    </>
  </ContentLine>)
}

export default RegulationRegionLine
