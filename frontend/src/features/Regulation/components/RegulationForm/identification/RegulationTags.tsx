import { RegulatoryTagsLabel } from '@features/Regulation/components/RegulatoryZoneMetadata/constants'
import { regulationActions } from '@features/Regulation/slice'
import { RegulatoryTags } from '@features/Regulation/types'
import { REGULATORY_REFERENCE_KEYS } from '@features/Regulation/utils'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Checkbox, Icon } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

export function RegulationTags() {
  const dispatch = useBackofficeAppDispatch()
  const tags = useBackofficeAppSelector(state => state.regulation.processingRegulation?.tags)

  const updateTag = (tag: RegulatoryTags) => {
    const newTags = tags?.includes(tag) ? tags.filter(t => t !== tag) : [...(tags ?? []), tag]
    dispatch(regulationActions.updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.TAGS, value: newTags }))
  }

  return (
    <Wrapper>
      <CheckBoxContainer>
        <Checkbox
          checked={tags?.includes(RegulatoryTags.ARP)}
          label="Zone ARP"
          name="ARP"
          onChange={() => updateTag(RegulatoryTags.ARP)}
        />
        <Icon.Info size={16} title={RegulatoryTagsLabel[RegulatoryTags.ARP]} />
      </CheckBoxContainer>
      <CheckBoxContainer>
        <Checkbox
          checked={tags?.includes(RegulatoryTags.ZPF)}
          label="ZPF"
          name="ZPF"
          onChange={() => updateTag(RegulatoryTags.ZPF)}
        />
        <Icon.Info size={16} title={RegulatoryTagsLabel[RegulatoryTags.ZPF]} />
      </CheckBoxContainer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  gap: 24px;
`

const CheckBoxContainer = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
`
