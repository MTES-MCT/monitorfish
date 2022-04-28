import React from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'

const BeaconMalfunctionDetailsFollowUpRow = ({ dateText, children, smallSize, index }) => {
  return (
    <span key={dateText}>
      <DateSeparator
        data-cy={'side-window-beacon-malfunctions-detail-comment-date'}
        style={dateSeparatorStyle(index === 0)}
      >
        <Line style={lineStyle(smallSize)}/>
        <RowDate
          style={rowDateStyle(dateText === 'Aujourd\'hui', dateText === 'Hier', smallSize)}
        >
          {dateText}
        </RowDate>
      </DateSeparator>
      {children}
    </span>
  )
}

const DateSeparator = styled.div``
const dateSeparatorStyle = first => ({
  height: 20,
  width: 558,
  marginTop: first ? 10 : 30
})

const RowDate = styled.div``
const rowDateStyle = (isToday, isYesterday, smallSize) => ({
  marginTop: -23,
  width: 'fit-content',
  background: 'white',
  padding: 10,
  marginLeft: isToday
    ? smallSize ? 'calc(220px - 45px)' : 'calc(50% - 45px)'
    : isYesterday
      ? smallSize ? 'calc(220px - 23px)' : 'calc(50% - 23px)'
      : smallSize ? 'calc(220px - 43px)' : 'calc(50% - 43px)',
  color: COLORS.slateGray
})

const Line = styled.div``
const lineStyle = smallSize => ({
  width: smallSize ? 445 : 558,
  borderBottom: `1px solid ${COLORS.lightGray}`
})

export default BeaconMalfunctionDetailsFollowUpRow
