import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Accent, Icon, IconButton, Select, SingleTag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ContentLine } from '../../../commonStyles/Backoffice.style'
import { Label } from '../../../commonStyles/Input.style'
import { DEFAULT_MENU_CLASSNAME, REGULATORY_REFERENCE_KEYS } from '../../../Regulation/utils'
import { updateProcessingRegulationByKey } from '../../slice'

export function RegulationGeometryLine({ geometryIdList, setShowRegulatoryPreview, showRegulatoryPreview }) {
  const dispatch = useBackofficeAppDispatch()
  const { id } = useBackofficeAppSelector(state => state.regulation.processingRegulation)

  const onCloseIconClicked = async () => {
    await dispatch(updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.ID, value: undefined }))
    setShowRegulatoryPreview(false)
  }

  return (
    <ContentLine>
      <Label>Géométrie</Label>
      <StyledSelect
        error={id ? undefined : 'Géometrie requise.'}
        isErrorMessageHidden
        isLabelHidden
        label="Choisir un tracé"
        menuClassName={DEFAULT_MENU_CLASSNAME}
        name="Choisir un tracé"
        onChange={value => {
          dispatch(updateProcessingRegulationByKey({ key: 'id', value }))
        }}
        options={geometryIdList}
        value="Choisir un tracé"
      />
      {id && (
        <>
          <SingleTag onDelete={onCloseIconClicked}>{id as unknown as string}</SingleTag>
          {showRegulatoryPreview && (
            <IconButton
              accent={Accent.TERTIARY}
              Icon={Icon.Hide}
              iconSize={17}
              onClick={() => setShowRegulatoryPreview(false)}
              title="Cacher"
            />
          )}
          {!showRegulatoryPreview && (
            <IconButton
              accent={Accent.TERTIARY}
              Icon={Icon.Display}
              iconSize={17}
              onClick={() => setShowRegulatoryPreview(true)}
              title="Afficher"
            />
          )}
        </>
      )}
    </ContentLine>
  )
}

const StyledSelect = styled(Select)`
  margin-right: 8px;
`
