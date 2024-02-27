import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import { FRENCH_REGION_LIST } from '../../constants'
import Tag from '../Tag'
import MenuItem from '../custom_form/MenuItem'
import { DEFAULT_MENU_CLASSNAME, REGULATORY_REFERENCE_KEYS } from '../../../Regulation/utils'
import { updateProcessingRegulationByKey } from '../../slice'
import { formatDataForSelectPicker } from '@features/Backoffice/utils'

const RegulationRegionLine = props => {
  const { regionIsMissing, disabled } = props

  const dispatch = useDispatch()

  const { region: regionList } = useSelector(state => state.regulation.processingRegulation)

  const addRegionToSelectedRegionList = region => {
    const newRegionList = regionList ? [...regionList] : []
    newRegionList.push(region)
    dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGION, value: newRegionList }))
  }

  const removeRegionToSelectedRegionList = regionToRemove => {
    const regionToRemoveIndex = regionList.indexOf(regionToRemove)
    const newArray = [...regionList]
    newArray.splice(regionToRemoveIndex, 1)
    dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGION, value: newArray }))
  }

  function SelectedRegionList() {
    return regionList?.map(selectedRegion => {
      return (
        <Tag key={selectedRegion} tagValue={selectedRegion} onCloseIconClicked={removeRegionToSelectedRegionList} />
      )
    })
  }

  const onChange = value => {
    if (regionList?.includes(value)) {
      removeRegionToSelectedRegionList(value)
    } else {
      addRegionToSelectedRegionList(value)
    }
  }

  return (
    <ContentLine>
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
        renderMenuItem={(_, item) => (
          <MenuItem checked={regionList?.includes(item.value)} item={item} tag={'Checkbox'} />
        )}
        valueIsMissing={regionIsMissing}
        menuClassName={DEFAULT_MENU_CLASSNAME}
      />
      {regionList?.length > 0 && <SelectedRegionList />}
    </ContentLine>
  )
}

export default RegulationRegionLine
