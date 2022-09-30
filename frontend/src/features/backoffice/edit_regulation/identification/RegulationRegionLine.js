import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { DEFAULT_MENU_CLASSNAME, REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulatory'
import { formatDataForSelectPicker } from '../../../../utils'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import { FRENCH_REGION_LIST } from '../../constants'
import { updateProcessingRegulationByKey } from '../../Regulation.slice'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import Tag from '../Tag'

function RegulationRegionLine(props) {
  const { disabled, regionIsMissing } = props

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
    return regionList?.map(selectedRegion => (
      <Tag key={selectedRegion} onCloseIconClicked={removeRegionToSelectedRegionList} tagValue={selectedRegion} />
    ))
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
        data={formatDataForSelectPicker(FRENCH_REGION_LIST)}
        disabled={disabled}
        emptyMessage="aucune région à afficher"
        menuClassName={DEFAULT_MENU_CLASSNAME}
        menuStyle={{ overflowY: 'hidden', textOverflow: 'ellipsis', width: 200 }}
        onChange={onChange}
        placeholder="Choisir une région"
        renderMenuItem={(_, item) => <MenuItem checked={regionList?.includes(item.value)} item={item} tag="Checkbox" />}
        searchable={false}
        value="Choisir une région"
        valueIsMissing={regionIsMissing}
      />
      {regionList?.length > 0 && <SelectedRegionList />}
    </ContentLine>
  )
}

export default RegulationRegionLine
