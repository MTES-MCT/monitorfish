import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'

export function BeaconMalfunctionDetailsFollowUpRow({ children, date, hoveredDate, index, smallSize }) {
  return (
    <span key={date}>
      <DateSeparator
        data-cy="side-window-beacon-malfunctions-detail-comment-date"
        style={dateSeparatorStyle(index === 0)}
      >
        <Line style={lineStyle(smallSize)} />
        <RowDate style={rowDateStyle(date === "Aujourd'hui", date === 'Hier', smallSize)} title={hoveredDate}>
          {date}
        </RowDate>
      </DateSeparator>
      {children}
    </span>
  )
}

const DateSeparator = styled.div``
const dateSeparatorStyle = first => ({
  height: 20,
  marginTop: first ? 10 : 30,
  width: 558
})

const RowDate = styled.div``
const rowDateStyle = (isToday, isYesterday, smallSize) => {
  const style = {
    background: 'white',
    color: COLORS.slateGray,
    marginTop: -23,
    padding: 10,
    width: 'fit-content'
  }

  if (isToday) {
    return {
      ...style,
      marginLeft: smallSize ? 'calc(220px - 45px)' : 'calc(50% - 45px)'
    }
  }

  if (isYesterday) {
    return {
      ...style,
      marginLeft: smallSize ? 'calc(220px - 23px)' : 'calc(50% - 23px)'
    }
  }

  return {
    ...style,
    marginLeft: smallSize ? 'calc(220px - 43px)' : 'calc(50% - 43px)'
  }
}

const Line = styled.div``
const lineStyle = smallSize => ({
  borderBottom: `1px solid ${COLORS.lightGray}`,
  width: smallSize ? 445 : 558
})
