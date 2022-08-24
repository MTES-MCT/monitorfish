import React from 'react'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { UserType } from '../../../domain/entities/beaconMalfunction'
import { getTime } from '../../../utils'
import { Type } from './BeaconMalfunctionDetailsFollowUp'

function BeaconMalfunctionDetailsFollowUpCommentOrAction({
  actionOrComment,
  contentText,
  isLast,
  isLastDate,
  scrollToRef,
}) {
  return (
    <>
      {actionOrComment.type === Type.COMMENT ? (
        <div data-cy="side-window-beacon-malfunctions-detail-comment-content">
          <ActionOrCommentRow ref={isLastDate && isLast ? scrollToRef : null} style={actionOrCommentRow}>
            <CommentText style={commentTextStyle(actionOrComment.userType)}>
              {contentText.split('\n').map((item, idx) => (
                <span key={idx}>
                  {item}
                  <br />
                </span>
              ))}
            </CommentText>
          </ActionOrCommentRow>
          <ActionOrCommentRow style={actionOrCommentRow}>
            <CommentUserType style={commentUserTypeStyle}>
              {actionOrComment.userType} - {getTime(actionOrComment.dateTime, true)} (UTC)
            </CommentUserType>
          </ActionOrCommentRow>
        </div>
      ) : null}
      {actionOrComment.type === Type.ACTION ? (
        <div data-cy="side-window-beacon-malfunctions-detail-action-content">
          <ActionOrCommentRow ref={isLastDate && isLast ? scrollToRef : null} style={actionOrCommentRow}>
            <ActionText style={actionTextStyle}>{contentText}</ActionText>
          </ActionOrCommentRow>
          <ActionOrCommentRow style={actionOrCommentRow}>
            <CommentUserType style={commentUserTypeStyle}>
              {getTime(actionOrComment.dateTime, true)} (UTC)
            </CommentUserType>
          </ActionOrCommentRow>
        </div>
      ) : null}
    </>
  )
}

const ActionOrCommentRow = styled.div``
const actionOrCommentRow = {
  display: 'flex',
  width: '100%',
}

const CommentText = styled.div``
const commentTextStyle = userType => ({
  background: `${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray} 0% 0% no-repeat padding-box`,
  border: `1px solid ${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray}`,
  marginTop: 10,
  maxWidth: 480,
  padding: '10px 15px',
})

const ActionText = styled.div``
const actionTextStyle = {
  border: `2px solid ${COLORS.lightGray}`,
  marginTop: 10,
  maxWidth: 480,
  padding: '10px 15px',
}

const CommentUserType = styled.div``
const commentUserTypeStyle = {
  color: COLORS.slateGray,
  font: 'normal normal normal 11px/15px Marianne',
  marginTop: 2,
}

export default BeaconMalfunctionDetailsFollowUpCommentOrAction
