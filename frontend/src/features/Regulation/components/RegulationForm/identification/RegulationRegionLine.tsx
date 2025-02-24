import { OptionValue } from '@features/Mission/components/MissionList/FilterBar'
import { formatDataForSelectPicker } from '@features/Regulation/components/RegulationTables/utils'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { MultiSelect, SingleTag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { ContentLine } from '../../../../commonStyles/Backoffice.style'
import { Label } from '../../../../commonStyles/Input.style'
import { regulationActions } from '../../../slice'
import { REGULATORY_REFERENCE_KEYS } from '../../../utils'
import { FRENCH_REGION_LIST } from '../../RegulationTables/constants'

export function RegulationRegionLine({ isDisabled }) {
  const dispatch = useBackofficeAppDispatch()
  const regionList = useBackofficeAppSelector(state => state.regulation.processingRegulation?.region)

  const removeRegionToSelectedRegionList = async regionToRemove => {
    if (!regionList) {
      return
    }

    const regionToRemoveIndex = regionList.indexOf(regionToRemove)
    const newArray = [...regionList]
    newArray.splice(regionToRemoveIndex, 1)

    await dispatch(
      regulationActions.updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGION, value: newArray })
    )
  }

  const onChange = regions => {
    dispatch(
      regulationActions.updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.REGION, value: regions })
    )
  }

  return (
    <ContentLine>
      <Label>Région</Label>
      <StyledMultiSelect
        disabled={isDisabled}
        error={regionList?.length ? undefined : 'Région requise.'}
        isErrorMessageHidden
        isLabelHidden
        label="Choisir une région"
        name="Choisir une région"
        onChange={onChange}
        options={formatDataForSelectPicker(FRENCH_REGION_LIST)}
        placeholder="Choisir une région"
        renderValue={(_, items) => (items.length > 0 ? <OptionValue>Région ({items.length}) </OptionValue> : <></>)}
        searchable={false}
        value={regionList}
      />
      {regionList?.map(selectedRegion => (
        <StyledTag key={selectedRegion} onDelete={() => removeRegionToSelectedRegionList(selectedRegion)}>
          {selectedRegion}
        </StyledTag>
      ))}
    </ContentLine>
  )
}

const StyledMultiSelect = styled(MultiSelect)`
  margin-right: 8px;
  width: 150px;
`

const StyledTag = styled(SingleTag)`
  margin-right: 8px;
`
