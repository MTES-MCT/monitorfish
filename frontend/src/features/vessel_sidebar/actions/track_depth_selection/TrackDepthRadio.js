import React from 'react'
import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'
import { VesselTrackDepth } from '../../../../domain/entities/vesselTrackDepth'

const TrackDepthRadio = props => {
  return (
    <RadioWrapper>
      <RadioGroup
        inline
        name="trackDepthRadio"
        value={props.trackDepthRadioSelection}
        onChange={value => {
          props.setTrackDepthRadioSelection(value)
        }}
      >
        <Columns>
          <ColumnOne>
            <Radio value={VesselTrackDepth.LAST_DEPARTURE}>dernier DEP</Radio>
            <Radio value={VesselTrackDepth.TWELVE_HOURS}>12 heures</Radio>
            <Radio value={VesselTrackDepth.ONE_DAY}>24 heures</Radio>
            <Radio value={VesselTrackDepth.TWO_DAYS}>2 jours</Radio>
          </ColumnOne>
          <ColumnTwo>
            <Radio value={VesselTrackDepth.THREE_DAYS} data-cy={'vessel-track-depth-three-days'}>3 jours</Radio>
            <Radio value={VesselTrackDepth.ONE_WEEK}>1 semaine</Radio>
            <Radio value={VesselTrackDepth.TWO_WEEK}>2 semaines</Radio>
            <Radio value={VesselTrackDepth.ONE_MONTH}>1 mois</Radio>
          </ColumnTwo>
        </Columns>
      </RadioGroup>
    </RadioWrapper>
  )
}

const ColumnOne = styled.div``

const ColumnTwo = styled.div``

const Columns = styled.div`
  margin-left: 10px;
  display: flex;
  flex: 1 1;
`

const RadioWrapper = styled.div`
  padding: 0;
  font-size: 13px;
  margin-top: 10px;
`

export default TrackDepthRadio
