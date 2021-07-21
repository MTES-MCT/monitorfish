import React from 'react'
import styled from 'styled-components'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label } from '../../commonStyles/Input.style'
import CustomSelectComponent from './CustomSelectComponent'
import MenuItem from './MenuItem'
import Tag from './Tag'

const RegulationGeometryLine = props => {
  const {
    setSelectedGeometry,
    geometryIdList,
    selectedGeometry
  } = props

  return <CustomContentLine>
    <Label>Géométrie</Label>
    <CustomSelectComponent
        searchable={false}
        placeholder='Choisir un tracé'
        value={'Choisir un tracé'}
        onChange={setSelectedGeometry}
        data={geometryIdList}
        renderMenuItem={(_, item) =>
          <MenuItem checked={item.value === selectedGeometry}
            item={item} tag={'Radio'}/>}
      />
    {selectedGeometry &&
      <Tag
        selectedValue={selectedGeometry}
        onCloseIconClicked={_ => setSelectedGeometry()}
      />}
  </CustomContentLine>
}

const CustomContentLine = styled(ContentLine)`
  margin-top: 15px;
`

export default RegulationGeometryLine
