import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Accent, Icon, IconButton, SingleTag, Select } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ContentLine } from '../../../../commonStyles/Backoffice.style'
import { Label } from '../../../../commonStyles/Input.style'
import { regulationActions } from '../../../slice'
import { DEFAULT_MENU_CLASSNAME } from '../../../utils'

export function RegulationGeometryLine({
  geometryIdList,
  isRegulatoryPreviewDisplayed,
  setIsRegulatoryPreviewDisplayed
}) {
  const dispatch = useBackofficeAppDispatch()
  const displayedGeometryId = useBackofficeAppSelector(
    state => state.regulation.processingRegulation?.geometryId ?? state.regulation.processingRegulation?.id
  )

  const onCloseIconClicked = async () => {
    dispatch(regulationActions.updateProcessingRegulationByKey({ key: 'geometryId', value: undefined }))
    setIsRegulatoryPreviewDisplayed(false)
  }

  return (
    <ContentLine>
      <Label>Géométrie</Label>
      <StyledSelect
        error={displayedGeometryId ? undefined : 'Géometrie requise.'}
        isErrorMessageHidden
        isLabelHidden
        label="Choisir un tracé"
        menuClassName={DEFAULT_MENU_CLASSNAME}
        name="Choisir un tracé"
        onChange={value => {
          dispatch(regulationActions.updateProcessingRegulationByKey({ key: 'geometryId', value }))
        }}
        options={geometryIdList}
        placeholder="Choisir un tracé"
        style={{ width: '200px' }}
      />
      {displayedGeometryId && (
        <>
          <SingleTag onDelete={onCloseIconClicked}>{String(displayedGeometryId)}</SingleTag>
          <IconButton
            accent={Accent.TERTIARY}
            Icon={isRegulatoryPreviewDisplayed ? Icon.Hide : Icon.Display}
            iconSize={17}
            onClick={() => setIsRegulatoryPreviewDisplayed(!isRegulatoryPreviewDisplayed)}
            title={isRegulatoryPreviewDisplayed ? 'Cacher' : 'Afficher'}
          />
        </>
      )}
    </ContentLine>
  )
}

const StyledSelect = styled(Select)`
  margin-right: 8px;
`
