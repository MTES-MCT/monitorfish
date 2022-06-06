import React from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { getTime } from '../../../utils'
import { UserType } from '../../../domain/entities/beaconMalfunction'
import { Type } from './BeaconMalfunctionDetailsFollowUp'

const BeaconMalfunctionDetailsFollowUpItem = ({ item, contentText, scrollToRef, isLastDate, isLast }) => {
  return (<>
    {
      item.type === Type.COMMENT
        ? <div data-cy={'side-window-beacon-malfunctions-detail-comment-content'}>
          <ItemRow style={itemRow} ref={isLastDate && isLast ? scrollToRef : null}>
            <CommentText style={commentTextStyle(item.userType)}>{contentText}</CommentText>
          </ItemRow>
          <ItemRow style={itemRow}>
            <ItemUserType
              style={itemUserTypeStyle}>{item.userType} - {getTime(item.dateTime, true)} (UTC)</ItemUserType>
          </ItemRow>
        </div>
        : null
    }
    {
      item.type === Type.ACTION
        ? <div data-cy={'side-window-beacon-malfunctions-detail-action-content'}>
          <ItemRow style={itemRow} ref={isLastDate && isLast ? scrollToRef : null}>
            <ActionText style={actionTextStyle}>{contentText}</ActionText>
          </ItemRow>
          <ItemRow style={itemRow}>
            <ItemUserType
              style={itemUserTypeStyle}>{getTime(item.dateTime, true)} (UTC)</ItemUserType>
          </ItemRow>
        </div>
        : null
  }
  {
      item.type === Type.NOTIFICATION
        ? <div data-cy={'side-window-beacon-malfunctions-detail-notification-content'}>
          <ItemRow style={itemRow} ref={isLastDate && isLast ? scrollToRef : null}>
            <ActionText style={actionTextStyle}>{contentText}</ActionText>
          </ItemRow>
          <ItemRow style={itemRow}>
            <ItemUserType
              style={itemUserTypeStyle}>{getTime(item.dateTime, true)} (UTC)</ItemUserType>
          </ItemRow>
        </div>
        : null
  }
  </>)
}

const ItemRow = styled.div``
const itemRow = {
  width: '100%',
  display: 'flex'
}

const CommentText = styled.div``
const commentTextStyle = userType => ({
  background: `${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray} 0% 0% no-repeat padding-box`,
  border: `1px solid ${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray}`,
  maxWidth: 480,
  padding: '10px 15px',
  marginTop: 10
})

const ActionText = styled.div``
const actionTextStyle = {
  border: `2px solid ${COLORS.lightGray}`,
  maxWidth: 480,
  padding: '10px 15px',
  marginTop: 10
}

const ItemUserType = styled.div``
const itemUserTypeStyle = {
  font: 'normal normal normal 11px/15px Marianne',
  color: COLORS.slateGray,
  marginTop: 2
}

export default BeaconMalfunctionDetailsFollowUpItem
