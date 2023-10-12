import styled, { css } from 'styled-components'

import { COLORS } from '../../../../constants/constants'
import { DEFAULT_MENU_CLASSNAME, REGULATORY_REFERENCE_KEYS } from '../../../../domain/entities/regulation'
import { useBackofficeAppDispatch } from '../../../../hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '../../../../hooks/useBackofficeAppSelector'
import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import ShowIconSVG from '../../../icons/oeil_affiche.svg?react'
import HideIconSVG from '../../../icons/oeil_masque.svg?react'
import { updateProcessingRegulationByKey } from '../../slice'
import CustomSelectComponent from '../custom_form/CustomSelectComponent'
import MenuItem from '../custom_form/MenuItem'
import Tag from '../Tag'

export function RegulationGeometryLine({
  geometryIdList,
  geometryIsMissing,
  setShowRegulatoryPreview,
  showRegulatoryPreview
}) {
  const dispatch = useBackofficeAppDispatch()

  const { id } = useBackofficeAppSelector(state => state.regulation.processingRegulation)

  const onCloseIconClicked = () => {
    dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.ID, value: undefined }))
    setShowRegulatoryPreview(false)
  }

  return (
    <CustomContentLine>
      <Label>Géométrie</Label>
      <CustomSelectComponent
        data={geometryIdList}
        emptyMessage="aucun tracé à associer"
        menuClassName={DEFAULT_MENU_CLASSNAME}
        onChange={value => dispatch(updateProcessingRegulationByKey({ key: 'id', value }))}
        placeholder="Choisir un tracé"
        renderMenuItem={(_, item) => <MenuItem checked={item.value === id} item={item} tag="Radio" />}
        searchable={false}
        value="Choisir un tracé"
        valueIsMissing={geometryIsMissing}
      />
      {id && (
        <>
          <Tag onCloseIconClicked={onCloseIconClicked} tagValue={id} />
          <EyeWrapper>
            {showRegulatoryPreview ? (
              <ShowIcon onClick={() => setShowRegulatoryPreview(false)} />
            ) : (
              <HideIcon data-cy="edit-regulation-show-geometry" onClick={() => setShowRegulatoryPreview(true)} />
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
