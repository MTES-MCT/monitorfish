import React from 'react'
import DateRangePicker, { afterToday } from 'rsuite/lib/DateRangePicker'
import styled from 'styled-components'

const TrackDepthDateRange = ({ dates, modifyVesselTrackDepthFromDates, width }) => {
  return (
    <Wrapper width={width}>
      <DateRangePicker
        showOneCalendar
        placeholder="Choisir une période précise"
        cleanable
        size={'sm'}
        disabledDate={afterToday()}
        value={dates}
        onOk={nextValue => modifyVesselTrackDepthFromDates(nextValue)}
        onClean={() => modifyVesselTrackDepthFromDates([])}
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
  )
}

const Wrapper = styled.div`
  margin: 12px 0 20px 20px;
  width: ${props => props.width ? props.width : 197}px;
`

export default TrackDepthDateRange
