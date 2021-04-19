import React from "react";
import { afterToday } from 'rsuite/lib/DateRangePicker'
import styled from "styled-components";
import DateRangePicker from 'rsuite/lib/DateRangePicker'

const TrackDepthDateRange = props => {
    return (
      <Wrapper>
          <DateRangePicker
            showOneCalendar
            placeholder="Choisir une période précise"
            cleanable
            size={'sm'}
            disabledDate={afterToday()}
            value={props.dates}
            onChange={nextValue => {
                props.setDate(nextValue);
            }}
            ranges={[]}
            format="DD-MM-YYYY"
            locale={{
                sunday: 'Di',
                monday: 'Lu',
                tuesday: 'Ma',
                wednesday: 'Me',
                thursday: 'Je',
                friday: 'Ve',
                saturday: 'Sa',
                ok: 'OK',
                today: 'Aujourd\'hui',
                yesterday: 'Hier',
                last7Days: '7 derniers jours'
            }}
          />
      </Wrapper>
    );
}

const Wrapper = styled.div`
  margin: 12px 0 0 20px;
  width: 197px;
`

export default TrackDepthDateRange
