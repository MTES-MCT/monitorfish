import React from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'

function BeaconMalfunctionDetailsFollowUpRow({ children, dateText, index, smallSize }) {
  return (
    <span key={dateText}>
      <DateSeparator
        data-cy="side-window-beacon-malfunctions-detail-comment-date"
        style={dateSeparatorStyle(index === 0)}
      >
        <Line style={lineStyle(smallSize)} />
        <RowDate style={rowDateStyle(dateText === "Aujourd'hui", dateText === 'Hier', smallSize)}>{dateText}</RowDate>
      </DateSeparator>
      {children}
    </span>
  )
}

const DateSeparator = styled.div``
const dateSeparatorStyle = first => ({
  height: 20,
  marginTop: first ? 10 : 30,
  width: 558,
})

const RowDate = styled.div``
const rowDateStyle = (isToday, isYesterday, smallSize) => ({
  background: 'white',
  color: COLORS.slateGray,
  marginLeft: isToday
    ? smallSize
      ? 'calc(220px - 45px)'
      : 'calc(50% - 45px)'
    : isYesterday
    ? smallSize
      ? 'calc(220px - 23px)'
      : 'calc(50% - 23px)'
    : smallSize
    ? 'calc(220px - 43px)'
    : 'calc(50% - 43px)',
  marginTop: -23,
  padding: 10,
  width: 'fit-content',
})

const Line = styled.div``
const lineStyle = smallSize => ({
  borderBottom: `1px solid ${COLORS.lightGray}`,
  width: smallSize ? 445 : 558,
})

export default BeaconMalfunctionDetailsFollowUpRow
