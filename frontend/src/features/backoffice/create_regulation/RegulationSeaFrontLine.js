import React from 'react'
import styled from 'styled-components'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label } from '../../commonStyles/Input.style'
import CustomSelectComponent from './CustomSelectComponent'
import MenuItem from './MenuItem'
import Tag from './Tag'
import { getSelectPickerData } from '../../../domain/entities/regulatory'

const RegulationSeaFrontLine = props => {
  const {
    selectedSeaFront,
    setSelectedSeaFront,
    seaFrontIsMissing
  } = props

  return <CustomContentLine>
    <Label>Secteur</Label>
    <CustomSelectComponent
        searchable={false}
        menuStyle={{ width: 250, overflowY: 'hidden', textOverflow: 'ellipsis' }}
        placeholder='Choisir un secteur'
        value={'Choisir un secteur'}
        onChange={setSelectedSeaFront}
        data={getSelectPickerData()}
        renderMenuItem={(_, item) =>
          <MenuItem checked={item.value === selectedSeaFront}
            item={item} tag={'Radio'}/>}
        valueIsMissing={seaFrontIsMissing}
        groupBy='group'
      />
    {selectedSeaFront &&
      <Tag
        tagValue={selectedSeaFront}
        onCloseIconClicked={_ => setSelectedSeaFront()}
      />}
  </CustomContentLine>
}

const CustomContentLine = styled(ContentLine)`
  margin-top: 15px;
`

export default RegulationSeaFrontLine
