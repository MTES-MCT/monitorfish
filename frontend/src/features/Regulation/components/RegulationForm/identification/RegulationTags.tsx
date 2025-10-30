import { InfoText, InfoTextWrapper } from '@features/commonStyles/Backoffice.style'
import { regulationActions } from '@features/Regulation/slice'
import { RegulatoryTags } from '@features/Regulation/types'
import { REGULATORY_REFERENCE_KEYS } from '@features/Regulation/utils'
import { useBackofficeAppDispatch } from '@hooks/useBackofficeAppDispatch'
import { useBackofficeAppSelector } from '@hooks/useBackofficeAppSelector'
import { Checkbox } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { InfoBox } from '../InfoBox'

export function RegulationTags() {
  const dispatch = useBackofficeAppDispatch()
  const tags = useBackofficeAppSelector(state => state.regulation.processingRegulation?.tags)

  const updateTag = (tag: RegulatoryTags) => {
    const newTags = tags?.includes(tag) ? tags.filter(t => t !== tag) : [...(tags ?? []), tag]
    dispatch(regulationActions.updateProcessingRegulationByKey({ key: REGULATORY_REFERENCE_KEYS.TAGS, value: newTags }))
  }

  return (
    <TagsContainer>
      <CheckBoxContainer>
        <Checkbox
          checked={tags?.includes(RegulatoryTags.ARP)}
          label="Zone ARP"
          name="ARP"
          onChange={() => updateTag(RegulatoryTags.ARP)}
        />
        <InfoBox pointer={false}>
          <InfoTextWrapper>
            <InfoText>Zone issue d’une Analyse de Risque Pêche au sein d’une zone Natura 2000</InfoText>
          </InfoTextWrapper>
        </InfoBox>
      </CheckBoxContainer>
      <CheckBoxContainer>
        <Checkbox
          checked={tags?.includes(RegulatoryTags.ZPF)}
          label="ZPF"
          name="ZPF"
          onChange={() => updateTag(RegulatoryTags.ZPF)}
        />
        <InfoBox pointer={false}>
          <InfoTextWrapper>
            <InfoText>Zone de protection forte au sein d’une Aire Marine Protégée (AMP)</InfoText>
          </InfoTextWrapper>
        </InfoBox>
      </CheckBoxContainer>
    </TagsContainer>
  )
}

const TagsContainer = styled.div`
  display: flex;
  gap: 24px;
`

const CheckBoxContainer = styled.div`
  align-items: baseline;
  display: flex;
  gap: 8px;
`
