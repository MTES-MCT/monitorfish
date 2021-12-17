import React from 'react'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import { formatDataForSelectPicker } from '../../../../utils'
import { FRENCH_REGION_LIST } from '../../constants'
import Tag from '../Tag'
import MenuItem from '../custom_form/MenuItem'
import { DEFAULT_MENU_CLASSNAME } from '../../../../domain/entities/regulatory'

const RegulationRegionLine = props => {
  const {
    selectedRegionList,
    setSelectedRegionList,
    regionIsMissing,
    disabled
  } = props

  const addRegionToSelectedRegionList = (region) => {
    const newArray = selectedRegionList ? [...selectedRegionList] : []
    newArray.push(region)
    setSelectedRegionList(newArray)
  }

  const removeRegionToSelectedRegionList = (regionToRemove) => {
    const regionToRemoveIndex = selectedRegionList.indexOf(regionToRemove)
    const newArray = [...selectedRegionList]
    newArray.splice(regionToRemoveIndex, 1)
    setSelectedRegionList(newArray)
  }

  function SelectedRegionList () {
    return selectedRegionList?.map(selectedRegion => {
      return <Tag
        key={selectedRegion}
        tagValue={selectedRegion}
        onCloseIconClicked={removeRegionToSelectedRegionList}
      />
    })
  }

  const onChange = (value) => {
    if (selectedRegionList?.includes(value)) {
      removeRegionToSelectedRegionList(value)
    } else {
      addRegionToSelectedRegionList(value)
    }
  }

  return (<ContentLine>
    <Label>Région</Label>
    <CustomSelectComponent
      disabled={disabled}
      menuStyle={{ width: 200, overflowY: 'hidden', textOverflow: 'ellipsis' }}
      searchable={false}
      placeholder={'Choisir une région'}
      onChange={onChange}
      value={'Choisir une région'}
      emptyMessage={'aucune région à afficher'}
      data={formatDataForSelectPicker(FRENCH_REGION_LIST)}
      renderMenuItem={(_, item) => <MenuItem checked={selectedRegionList?.includes(item.value)} item={item} tag={'Checkbox'} />}
      valueIsMissing={regionIsMissing}
      menuClassName={DEFAULT_MENU_CLASSNAME}
    />
    {
      selectedRegionList?.length > 0 &&
      <SelectedRegionList />
    }
  </ContentLine>)
}

export default RegulationRegionLine
