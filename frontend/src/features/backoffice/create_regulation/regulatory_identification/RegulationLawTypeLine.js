import React, { useCallback } from 'react'
import { batch, useDispatch, useSelector } from 'react-redux'
import Tag from '../Tag'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import {
  DEFAULT_MENU_CLASSNAME,
  LAWTYPES_TO_TERRITORY,
  UE,
  REGULATORY_REFERENCE_KEYS
} from '../../../../domain/entities/regulatory'
import { setRegulationByKey } from '../../Regulation.slice'

const RegulationLawTypeLine = ({ selectData, lawTypeIsMissing }) => {
  const dispatch = useDispatch()

  const { lawType } = useSelector(state => state.regulation.currentRegulation)

  const onLawTypeChange = useCallback((value) => {
    if (LAWTYPES_TO_TERRITORY[value] !== UE) {
      dispatch(setRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGION, value: [] }))
    }
    batch(() => {
      dispatch(setRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.TOPIC, value: undefined }))
      dispatch(setRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.LAW_TYPE, value: value }))
    })
  }, [setRegulationByKey])

  return (
    <ContentLine>
      <Label>Ensemble réglementaire</Label>
      <CustomSelectComponent
        searchable={false}
        menuStyle={{ width: 250, overflowY: 'scroll', textOverflow: 'ellipsis' }}
        placeholder='Choisir un ensemble'
        value={'Choisir un ensemble'}
        onChange={onLawTypeChange}
        data={selectData}
        data-cy={'regulation-lawtype-select'}
        emptyMessage={'aucun ensemble à afficher'}
        renderMenuItem={(_, item) =>
          <MenuItem
            checked={item.value === onLawTypeChange}
            item={item}
            tag={'Radio'} />}
        valueIsMissing={lawTypeIsMissing}
        menuClassName={DEFAULT_MENU_CLASSNAME}
      />
      {lawType &&
        <Tag
          tagValue={lawType}
          onCloseIconClicked={_ => onLawTypeChange()}
        />
      }
    </ContentLine>
  )
}

export default RegulationLawTypeLine
