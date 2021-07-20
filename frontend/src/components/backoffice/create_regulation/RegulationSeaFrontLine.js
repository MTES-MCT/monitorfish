import React from 'react'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label } from '../../commonStyles/Input.style'
import CustomSelectComponent from './CustomSelectComponent'
import MenuItem from './MenuItem'
import Tag from './Tag'

const RegulationSeaFrontLine = props => {
  const {
    selectedSeaFront,
    setSelectedSeaFront,
    seaFrontList
  } = props

  return <ContentLine>
    <Label>Secteur</Label>
    <CustomSelectComponent
        searchable={false}
        placeholder='Choisir un secteur'
        value={'Choisir un secteur'}
        onChange={setSelectedSeaFront}
        data={seaFrontList}
        renderMenuItem={(_, item) =>
          <MenuItem checked={item.value === selectedSeaFront}
            item={item} tag={'Radio'}/>}
      />
    {selectedSeaFront &&
      <Tag
        selectedValue={selectedSeaFront}
        onCloseIconClicked={_ => setSelectedSeaFront()}
      />}
  </ContentLine>
}

export default RegulationSeaFrontLine
