import { getTime } from '@utils/getTime'
import styled from 'styled-components'

import { BeaconMalfunctionDetailsType } from './beaconMalfunctions'
import { COLORS } from '../../../constants/constants'
import { UserType } from '../../../domain/entities/beaconMalfunction/constants'

export function BeaconMalfunctionDetailsFollowUpItem({ contentText, isLast, isLastDate, item, scrollToRef }) {
  return (
    <>
      {item.type === BeaconMalfunctionDetailsType.COMMENT && (
        <div data-cy="side-window-beacon-malfunctions-detail-comment-content">
          <ItemRow ref={isLastDate && isLast ? scrollToRef : null} style={itemRow}>
            <CommentText style={commentTextStyle(item.userType)}>{contentText}</CommentText>
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
const commentTextStyle = userType => ({
  background: `${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray} 0% 0% no-repeat padding-box`,
  border: `1px solid ${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray}`,
  marginTop: 10,
  maxWidth: 480,
  padding: '10px 15px'
})

const ActionText = styled.div``
const actionTextStyle = {
  border: `2px solid ${COLORS.lightGray}`,
  marginTop: 10,
  maxWidth: 480,
  padding: '10px 15px'
}

const ItemUserType = styled.div``
const itemUserTypeStyle = {
  color: COLORS.slateGray,
  font: 'normal normal normal 11px/15px Marianne',
  marginTop: 2
}
