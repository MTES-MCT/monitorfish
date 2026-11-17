import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { BeaconMalfunctionDetailsType } from './utils'
import { getTime } from '../../../../utils'

export function BeaconMalfunctionDetailsFollowUpItem({ contentText, isLast, isLastDate, item, scrollToRef }) {
  return (
    <>
      {item.type === BeaconMalfunctionDetailsType.COMMENT && (
        <div data-cy="side-window-beacon-malfunctions-detail-comment-content">
          <ItemRow ref={isLastDate && isLast ? scrollToRef : null} style={itemRow}>
            <CommentText style={commentTextStyle}>{contentText}</CommentText>
          </ItemRow>
          <ItemRow style={itemRow}>
            <ItemUserType style={itemUserTypeStyle}>
              {item.userType} - {getTime(item.dateTime, true)} (UTC)
            </ItemUserType>
          </ItemRow>
        </div>
      )}
      {item.type === BeaconMalfunctionDetailsType.ACTION && (
        <div data-cy="side-window-beacon-malfunctions-detail-action-content">
          <ItemRow ref={isLastDate && isLast ? scrollToRef : null} style={itemRow}>
            <ActionText style={actionTextStyle}>{contentText}</ActionText>
          </ItemRow>
          <ItemRow style={itemRow}>
            <ItemUserType style={itemUserTypeStyle}>{getTime(item.dateTime, true)} (UTC)</ItemUserType>
          </ItemRow>
        </div>
      )}
      {item.type === BeaconMalfunctionDetailsType.NOTIFICATION && (
        <div data-cy="side-window-beacon-malfunctions-detail-notification-content">
          <ItemRow ref={isLastDate && isLast ? scrollToRef : null} style={itemRow}>
            <ActionText style={actionTextStyle}>{contentText}</ActionText>
          </ItemRow>
          <ItemRow style={itemRow}>
            <ItemUserType style={itemUserTypeStyle}>{getTime(item.dateTime, true)} (UTC)</ItemUserType>
          </ItemRow>
        </div>
      )}
    </>
  )
}

const ItemRow = styled.div``
const itemRow = {
  display: 'flex',
  width: '100%'
}

const CommentText = styled.div``
const commentTextStyle = {
  background: `${THEME.color.blueGray25} 0% 0% no-repeat padding-box`,
  border: `1px solid ${THEME.color.lightGray}`,
  marginTop: 10,
  maxWidth: 480,
  padding: '10px 15px'
}

const ActionText = styled.div``
const actionTextStyle = {
  border: `2px solid ${THEME.color.lightGray}`,
  marginTop: 10,
  maxWidth: 480,
  padding: '10px 15px'
}

const ItemUserType = styled.div``
const itemUserTypeStyle = {
  color: THEME.color.slateGray,
  font: 'normal normal normal 11px/15px Marianne',
  marginTop: 2
}
