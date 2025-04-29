import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Select, SingleTag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ContentLine } from '../../../../commonStyles/Backoffice.style'
import { Label } from '../../../../commonStyles/Input.style'
import { regulationActions } from '../../../slice'
import { LAWTYPES_TO_TERRITORY, REGULATORY_REFERENCE_KEYS, UE } from '../../../utils'

export function RegulationLawTypeLine({ selectData }) {
  const dispatch = useBackofficeAppDispatch()

  const lawType = useBackofficeAppSelector(state => state.regulation.processingRegulation?.lawType)

  const onLawTypeChange = async (value?) => {
    if (LAWTYPES_TO_TERRITORY[value] !== UE) {
      dispatch(regulationActions.updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGION, value: [] }))
    }

    dispatch(
      regulationActions.updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.TOPIC, value: undefined })
    )
    dispatch(regulationActions.updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.LAW_TYPE, value }))
  }

  return (
    <ContentLine>
      <Label>Ensemble réglementaire</Label>
      <Select
        data-cy="regulation-lawtype-select"
        isLabelHidden
        label="Choisir un ensemble"
        name="Choisir un ensemble"
        onChange={onLawTypeChange}
        options={selectData}
        placeholder="Choisir un ensemble"
        searchable={false}
      />
      {lawType && <StyledTag onDelete={onLawTypeChange}>{lawType as unknown as string}</StyledTag>}
    </ContentLine>
  )
}

const StyledTag = styled(SingleTag)`
  margin-left: 8px;
`
