import React from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { getTime } from '../../../utils'
import { UserType } from '../../../domain/entities/beaconMalfunction'
import { Type } from './BeaconMalfunctionDetailsFollowUp'

const BeaconMalfunctionDetailsFollowUpCommentOrAction = ({ actionOrComment, contentText, scrollToRef, isLastDate, isLast }) => {
  return (<>
    {
      actionOrComment.type === Type.COMMENT
        ? <div data-cy={'side-window-beacon-malfunctions-detail-comment-content'}>
          <ActionOrCommentRow style={actionOrCommentRow} ref={isLastDate && isLast ? scrollToRef : null}>
            <CommentText style={commentTextStyle(actionOrComment.userType)}>
              {
                contentText.split('\n').map((item, idx) => {
                  return (
                    <span key={idx}>
                      {item}
                      <br/>
                    </span>
                  )
                })
              }
            </CommentText>
          </ActionOrCommentRow>
          <ActionOrCommentRow style={actionOrCommentRow}>
            <CommentUserType
              style={commentUserTypeStyle}>{actionOrComment.userType} - {getTime(actionOrComment.dateTime, true)} (UTC)</CommentUserType>
          </ActionOrCommentRow>
        </div>
        : null
    }
    {
      actionOrComment.type === Type.ACTION
        ? <div data-cy={'side-window-beacon-malfunctions-detail-action-content'}>
          <ActionOrCommentRow style={actionOrCommentRow} ref={isLastDate && isLast ? scrollToRef : null}>
            <ActionText style={actionTextStyle}>{contentText}</ActionText>
          </ActionOrCommentRow>
          <ActionOrCommentRow style={actionOrCommentRow}>
            <CommentUserType
              style={commentUserTypeStyle}>{getTime(actionOrComment.dateTime, true)} (UTC)</CommentUserType>
          </ActionOrCommentRow>
        </div>
        : null
  }
  </>)
}

const ActionOrCommentRow = styled.div``
const actionOrCommentRow = {
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

const CommentUserType = styled.div``
const commentUserTypeStyle = {
  font: 'normal normal normal 11px/15px Marianne',
  color: COLORS.slateGray,
  marginTop: 2
}

export default BeaconMalfunctionDetailsFollowUpCommentOrAction
