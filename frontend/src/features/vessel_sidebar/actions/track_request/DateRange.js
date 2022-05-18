import React from 'react'
import DateRangePicker, { beforeToday } from 'rsuite/lib/DateRangePicker'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'

/** Add the timezone offset back, as the DateRangePicker component
 * use the local timezone and not the UTC timezone.
 *
 * @param {Date} date
 * @return {Date}
 */
function convertToLocalDates (date) {
  const nextDate = new Date(date.toISOString())
  nextDate.setMinutes(nextDate.getMinutes() + nextDate.getTimezoneOffset())

  return nextDate
}

const DateRange = ({ dates, resetToDefaultTrackDepth, modifyVesselTrackFromDates, width, placeholder, containerRef }) => {
  return (
    <Wrapper
      style={wrapperStyle(width)}
      hasDates={dates?.length}
    >
      <DateRangePicker
        container={containerRef || null}
        showOneCalendar
        placeholder={placeholder}
        cleanable
        size={'sm'}
        disabledDate={beforeToday()}
        value={dates.map(date => convertToLocalDates(date))}
        onOk={modifyVesselTrackFromDates}
        onClean={resetToDefaultTrackDepth}
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
  .rs-picker-daterange {
    ${props => props.hasDates ? `background: ${COLORS.gainsboro}` : null}
  } 
`

const wrapperStyle = width => ({
  margin: '12px 0 20px 20px',
  width: width || 197
})

export default DateRange
