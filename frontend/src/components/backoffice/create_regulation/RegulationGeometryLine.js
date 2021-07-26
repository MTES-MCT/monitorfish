import React from 'react'
import styled, { css } from 'styled-components'
import { ContentLine } from '../../commonStyles/Backoffice.style'
import { Label } from '../../commonStyles/Input.style'
import CustomSelectComponent from './CustomSelectComponent'
import MenuItem from './MenuItem'
import Tag from './Tag'
import { ReactComponent as ShowIconSVG } from '../../icons/oeil_affiche.svg'
import { ReactComponent as HideIconSVG } from '../../icons/oeil_masque.svg'
import { COLORS } from '../../../constants/constants'

const RegulationGeometryLine = props => {
  const {
    setSelectedGeometry,
    geometryIdList,
    selectedGeometry,
    setShowRegulatoryPreview,
    showRegulatoryPreview
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
      <><Tag
        selectedValue={selectedGeometry}
        onCloseIconClicked={_ => setSelectedGeometry()}
      />
      { showRegulatoryPreview
        ? <HideIcon onClick={() => setShowRegulatoryPreview(false)}/>
        : <ShowIcon onClick={() => setShowRegulatoryPreview(true)}/>
      }
      </>
    }
  </CustomContentLine>
}

const CustomContentLine = styled(ContentLine)`
  margin-top: 15px;
`

const baseIcon = css`
  width: 15px;
  height: 10px;
  padding: 8px 5px 7px 5px;
  border: 1px solid ${COLORS.grayDarker};
  border-radius: 2px;
  cursor: pointer;
`

const ShowIcon = styled(ShowIconSVG)`
  ${baseIcon}
`

const HideIcon = styled(HideIconSVG)`
  ${baseIcon}
`

export default RegulationGeometryLine
