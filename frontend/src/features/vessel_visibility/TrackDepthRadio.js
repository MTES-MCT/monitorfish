import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Radio, RadioGroup } from 'rsuite'
import styled from 'styled-components'

import { VesselTrackDepth } from '../../domain/entities/vesselTrackDepth'
import updateDefaultVesselTrackDepth from '../../domain/use_cases/vessel/updateDefaultVesselTrackDepth'

function TrackDepthRadio() {
  const dispatch = useDispatch()
  const { defaultVesselTrackDepth } = useSelector(state => state.map)

  return (
    <>
      {defaultVesselTrackDepth ? (
        <RadioWrapper>
          <RadioGroup
            inline
            name="trackDepthRadio"
            onChange={value => {
              dispatch(updateDefaultVesselTrackDepth(value))
            }}
            value={defaultVesselTrackDepth}
          >
            <Columns>
              <ColumnOne>
                <Radio value={VesselTrackDepth.LAST_DEPARTURE}>depuis dernier DEP</Radio>
                <Radio data-cy="global-vessel-track-depth-twelve-hours" value={VesselTrackDepth.TWELVE_HOURS}>
                  12 heures
                </Radio>
                <Radio value={VesselTrackDepth.ONE_DAY}>24 heures</Radio>
              </ColumnOne>
              <ColumnTwo>
                <Radio value={VesselTrackDepth.TWO_DAYS}>2 jours</Radio>
                <Radio value={VesselTrackDepth.THREE_DAYS}>3 jours</Radio>
                <Radio data-cy="global-vessel-track-depth-one-week" value={VesselTrackDepth.ONE_WEEK}>
                  1 semaine
                </Radio>
              </ColumnTwo>
              <ColumnThree>
                <Radio value={VesselTrackDepth.TWO_WEEK}>2 semaines</Radio>
                <Radio value={VesselTrackDepth.THREE_WEEK}>3 semaines</Radio>
                <Radio value={VesselTrackDepth.ONE_MONTH}>1 mois</Radio>
              </ColumnThree>
            </Columns>
          </RadioGroup>
        </RadioWrapper>
      ) : null}
    </>
  )
}

const ColumnOne = styled.div``

const ColumnTwo = styled.div``

const ColumnThree = styled.div``

const Columns = styled.div`
  margin-left: 3px;
  display: flex;
  flex: 1 1 1;
`

const RadioWrapper = styled.div`
  padding: 10px 0 20px 0;
  font-size: 13px;
`

export default TrackDepthRadio
