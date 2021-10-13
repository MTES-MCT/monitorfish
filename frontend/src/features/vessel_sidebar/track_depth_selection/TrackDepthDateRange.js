import React from 'react'
import DateRangePicker, { afterToday } from 'rsuite/lib/DateRangePicker'
import styled from 'styled-components'

export const convertToUTCDay = datesSelection => {
  if (!(datesSelection?.length === 2)) {
    return {
      afterDateTime: null,
      beforeDateTime: null
    }
  }

  const afterDateTime = new Date(datesSelection[0].getTime())
  const beforeDateTime = new Date(datesSelection[1].getTime())

  afterDateTime.setHours(0, 0, 0)
  beforeDateTime.setHours(23, 59, 59)

  afterDateTime.setMinutes(afterDateTime.getMinutes() - afterDateTime.getTimezoneOffset())
  beforeDateTime.setMinutes(beforeDateTime.getMinutes() - beforeDateTime.getTimezoneOffset())

  return { afterDateTime, beforeDateTime }
}

const TrackDepthDateRange = ({ dates, setDate, width }) => {
  return (
    <Wrapper width={width}>
      <DateRangePicker
        showOneCalendar
        placeholder="Choisir une période précise"
        cleanable
        size={'sm'}
        disabledDate={afterToday()}
        value={dates}
        onOk={nextValue => setDate(nextValue)}
        onClean={() => setDate([])}
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
