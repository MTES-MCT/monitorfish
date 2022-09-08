import { useMemo } from 'react'
import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'

/**
 * @typedef {object} TrackDepthProps
 * @property {VesselNS.VesselTrackDepthKey} value
 * @property {(newValue: Omit<VesselNS.VesselTrackDepthKey, 'CUSTOM'>) => void} onChange
 */

/**
 * @param {TrackDepthProps} props
 */
export function TrackDepth({ onChange, value }) {
  const controlledValue = useMemo(() => (value !== VesselTrackDepth.CUSTOM ? value : undefined), [value])

  return (
    <RadioGroup inline onChange={onChange} value={controlledValue}>
      <ColumnsBox>
        <Column>
          <StyledRadio value={VesselTrackDepth.LAST_DEPARTURE}>le dernier DEP</StyledRadio>
          <StyledRadio value={VesselTrackDepth.TWELVE_HOURS}>12 heures</StyledRadio>
          <StyledRadio value={VesselTrackDepth.ONE_DAY}>24 heures</StyledRadio>
          <StyledRadio value={VesselTrackDepth.TWO_DAYS}>2 jours</StyledRadio>
        </Column>
        <Column>
          <StyledRadio value={VesselTrackDepth.THREE_DAYS}>3 jours</StyledRadio>
          <StyledRadio value={VesselTrackDepth.ONE_WEEK}>1 semaine</StyledRadio>
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
