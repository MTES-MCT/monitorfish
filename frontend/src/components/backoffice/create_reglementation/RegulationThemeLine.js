import React from 'react'
import {
  ContentLine,
  Label
} from '../common_styles'
import CustomSelectComponent from './CustomSelectComponent'
import MenuItem from './MenuItem'
import Tag from './Tag'

const RegulationThemeLine = props => {
  const {
    selectedSeaFront,
    setSelectedSeaFront,
    seaFrontList
  } = props

  return <ContentLine>
    <Label>Secteur</Label>
    <CustomSelectComponent
        searchable={false}
        placeholder='Choisir une thématique'
        value={'Choisir une thématique'}
        onChange={setSelectedSeaFront}
        data={seaFrontList}
        renderMenuItem={(_, item) =>
          <MenuItem checked={item.value === selectedSeaFront}
            item={item} tag={'Radio'}/>}
      />
    {selectedSeaFront &&
      <Tag
        selectedValue={selectedSeaFront}
        setSelectedValue={setSelectedSeaFront}
      />}
  </ContentLine>
}

export default RegulationThemeLine
