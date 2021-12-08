import React from 'react'
import Tag from '../Tag'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import { DEFAULT_MENU_CLASSNAME } from '../../../../domain/entities/regulatory'
const RegulationLawTypeLine = props => {
  const {
    setSelectedValue,
    selectedValue,
    selectData,
    lawTypeIsMissing
  } = props

  return (
    <ContentLine>
      <Label>Ensemble réglementaire</Label>
      <CustomSelectComponent
        searchable={false}
        menuStyle={{ width: 250, overflowY: 'scroll', textOverflow: 'ellipsis' }}
        placeholder='Choisir un ensemble'
        value={'Choisir un ensemble'}
        onChange={setSelectedValue}
        data={selectData}
        data-cy={'regulation-lawtype-select'}
        emptyMessage={'aucun ensemble à afficher'}
        renderMenuItem={(_, item) =>
          <MenuItem
            checked={item.value === selectedValue}
            item={item}
            tag={'Radio'} />}
        valueIsMissing={lawTypeIsMissing}
        menuClassName={DEFAULT_MENU_CLASSNAME}
      />
      {selectedValue &&
        <Tag
          tagValue={selectedValue}
          onCloseIconClicked={_ => setSelectedValue()}
        />
      }
    </ContentLine>
  )
}

export default RegulationLawTypeLine
