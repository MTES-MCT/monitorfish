import React from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'

import {
  DEFAULT_MENU_CLASSNAME,
  LAWTYPES_TO_TERRITORY,
  UE,
  REGULATORY_REFERENCE_KEYS,
} from '../../../../domain/entities/regulatory'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import { updateProcessingRegulationByKey } from '../../Regulation.slice'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import Tag from '../Tag'

function RegulationLawTypeLine({ lawTypeIsMissing, selectData }) {
  const dispatch = useDispatch()

  const { lawType } = useSelector(state => state.regulation.processingRegulation)

  const onLawTypeChange = value => {
    if (LAWTYPES_TO_TERRITORY[value] !== UE) {
      dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGION, value: [] }))
    }
    batch(() => {
      dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.TOPIC, value: undefined }))
      dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.LAW_TYPE, value }))
    })
  }

  return (
    <ContentLine>
      <Label>Ensemble réglementaire</Label>
      <CustomSelectComponent
        data={selectData}
        data-cy="regulation-lawtype-select"
        emptyMessage="aucun ensemble à afficher"
        menuClassName={DEFAULT_MENU_CLASSNAME}
        menuStyle={{ overflowY: 'scroll', textOverflow: 'ellipsis', width: 250 }}
        onChange={onLawTypeChange}
        placeholder="Choisir un ensemble"
        renderMenuItem={(_, item) => <MenuItem checked={item.value === onLawTypeChange} item={item} tag="Radio" />}
        searchable={false}
        value="Choisir un ensemble"
        valueIsMissing={lawTypeIsMissing}
      />
      {lawType && <Tag onCloseIconClicked={_ => onLawTypeChange()} tagValue={lawType} />}
    </ContentLine>
  )
}

export default RegulationLawTypeLine
