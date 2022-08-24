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
function TrackDepth({ onChange, value }) {
  const controlledValue = useMemo(() => (value !== VesselTrackDepth.CUSTOM ? value : undefined), [value])

  return (
    <RadioWrapper>
      <RadioGroup inline name="trackDepthRadio" onChange={onChange} value={controlledValue}>
        <Columns>
          <div>
            <Radio value={VesselTrackDepth.LAST_DEPARTURE}>dernier DEP</Radio>
            <Radio data-cy="vessel-track-depth-twelve-hours" value={VesselTrackDepth.TWELVE_HOURS}>
              12 heures
            </Radio>
            <Radio value={VesselTrackDepth.ONE_DAY}>24 heures</Radio>
            <Radio value={VesselTrackDepth.TWO_DAYS}>2 jours</Radio>
          </div>
          <div>
            <Radio data-cy="vessel-track-depth-three-days" value={VesselTrackDepth.THREE_DAYS}>
              3 jours
            </Radio>
            <Radio value={VesselTrackDepth.ONE_WEEK}>1 semaine</Radio>
            <Radio value={VesselTrackDepth.TWO_WEEK}>2 semaines</Radio>
            <Radio value={VesselTrackDepth.ONE_MONTH}>1 mois</Radio>
          </div>
        </Columns>
      </RadioGroup>
    </RadioWrapper>
  )
}

const Columns = styled.div`
  display: flex;
  flex: 1 1;
  margin-left: 10px;
`

const RadioWrapper = styled.div`
  font-size: 13px;
  margin-top: 10px;
  padding: 0;
`

export default TrackDepth
