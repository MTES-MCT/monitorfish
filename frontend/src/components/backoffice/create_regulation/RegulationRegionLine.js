import React from 'react'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label } from '../../commonStyles/Input.style'
import CustomSelectComponent from './CustomSelectComponent'
import { formatDataForSelectPicker } from '../../../utils'
import { FRENCH_REGION_LIST } from '../../../constants/constants'
import Tag from './Tag'
import MenuItem from './MenuItem'

const RegulationRegionLine = props => {
  const {
    selectedRegionList,
    setSelectedRegionList
  } = props

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
      data={formatDataForSelectPicker(FRENCH_REGION_LIST)}
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
