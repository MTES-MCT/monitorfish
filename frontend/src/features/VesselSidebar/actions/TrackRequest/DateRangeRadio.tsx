import { useMemo } from 'react'
import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'

import type { Promisable } from 'type-fest'

type DateRangeRadioProps = {
  defaultValue?: VesselTrackDepth
  onChange: (nextTrackDepth: Exclude<VesselTrackDepth, 'CUSTOM'>) => Promisable<void>
}
export function DateRangeRadio({ defaultValue, onChange }: DateRangeRadioProps) {
  const normalizedDefaultValue = useMemo(
    () => (defaultValue !== VesselTrackDepth.CUSTOM ? defaultValue : undefined),
    [defaultValue]
  )

  return (
    <RadioGroup key={defaultValue} defaultValue={normalizedDefaultValue as any} inline onChange={onChange as any}>
      <ColumnsBox>
        <Column>
          <StyledRadio value={VesselTrackDepth.LAST_DEPARTURE}>le dernier DEP</StyledRadio>
          <StyledRadio data-cy="vessel-track-depth-twelve-hours" value={VesselTrackDepth.TWELVE_HOURS}>
            12 heures
          </StyledRadio>
          <StyledRadio value={VesselTrackDepth.ONE_DAY}>24 heures</StyledRadio>
          <StyledRadio value={VesselTrackDepth.TWO_DAYS}>2 jours</StyledRadio>
        </Column>
        <Column>
          <StyledRadio data-cy="vessel-track-depth-three-days" value={VesselTrackDepth.THREE_DAYS}>
            3 jours
          </StyledRadio>
          <StyledRadio data-cy="vessel-track-depth-one-week" value={VesselTrackDepth.ONE_WEEK}>
            1 semaine
          </StyledRadio>
          <StyledRadio value={VesselTrackDepth.TWO_WEEK}>2 semaines</StyledRadio>
          <StyledRadio value={VesselTrackDepth.ONE_MONTH}>1 mois</StyledRadio>
        </Column>
      </ColumnsBox>
    </RadioGroup>
  )
}

const ColumnsBox = styled.div`
  display: flex;
  flex-grow: 1;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 0.5;
`

const StyledRadio = styled(Radio)`
  margin-bottom: 0.25rem;

  .rs-radio-checker {
    label {
      padding-left: 0.5rem;
      vertical-align: -3px;
    }
  }
`
