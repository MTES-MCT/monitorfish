import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled, { css } from 'styled-components'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import Tag from '../Tag'
import ShowIconSVG from '../../../icons/oeil_affiche.svg?react'
import HideIconSVG from '../../../icons/oeil_masque.svg?react'
import { COLORS } from '../../../../constants/constants'
import { updateProcessingRegulationByKey } from '../../slice'
import { DEFAULT_MENU_CLASSNAME, REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulation'

const RegulationGeometryLine = props => {
  const { geometryIdList, setShowRegulatoryPreview, showRegulatoryPreview, geometryIsMissing } = props

  const dispatch = useDispatch()

  const { id } = useSelector(state => state.regulation.processingRegulation)

  const onCloseIconClicked = () => {
    dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.ID, value: undefined }))
    setShowRegulatoryPreview(false)
  }

  return (
    <CustomContentLine>
      <Label>Géométrie</Label>
      <CustomSelectComponent
        searchable={false}
        placeholder="Choisir un tracé"
        value={'Choisir un tracé'}
        onChange={value => dispatch(updateProcessingRegulationByKey({ key: 'id', value }))}
        data={geometryIdList}
        valueIsMissing={geometryIsMissing}
        emptyMessage={'aucun tracé à associer'}
        renderMenuItem={(_, item) => <MenuItem checked={item.value === id} item={item} tag={'Radio'} />}
        menuClassName={DEFAULT_MENU_CLASSNAME}
      />
      {id && (
        <>
          <Tag tagValue={id} onCloseIconClicked={onCloseIconClicked} />
          <EyeWrapper>
            {showRegulatoryPreview ? (
              <ShowIcon onClick={() => setShowRegulatoryPreview(false)} />
            ) : (
              <HideIcon onClick={() => setShowRegulatoryPreview(true)} />
            )}
          </EyeWrapper>
        </>
      )}
    </CustomContentLine>
  )
}

const CustomContentLine = styled(ContentLine)`
  margin-top: 15px;
`

const EyeWrapper = styled.div`
  border: 1px solid ${COLORS.lightGray};
  border-radius: 2px;
  cursor: pointer;
  height: 25px;
  width: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const baseIcon = css`
  width: 15px;
  height: 10px;
  cursor: pointer;
`

const ShowIcon = styled(ShowIconSVG)`
  ${baseIcon}
  width: 20px;
  height: 15px;
`

const HideIcon = styled(HideIconSVG)`
  ${baseIcon}
  width: 20px;
  height: 15px;
`

export default RegulationGeometryLine
