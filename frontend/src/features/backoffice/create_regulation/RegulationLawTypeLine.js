import React from 'react'
import Tag from './Tag'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label } from '../../commonStyles/Input.style'
import CustomSelectComponent from './CustomSelectComponent'
import MenuItem from './MenuItem'

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
        menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
        placeholder='Choisir un ensemble'
        value={'Choisir un ensemble'}
        onChange={setSelectedValue}
        data={selectData}
        data-cy={'regulation-lawtype-select'}
        renderMenuItem={(_, item) =>
          <MenuItem
            checked={item.value === selectedValue}
            item={item}
            tag={'Radio'} />}
        valueIsMissing={lawTypeIsMissing}
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
