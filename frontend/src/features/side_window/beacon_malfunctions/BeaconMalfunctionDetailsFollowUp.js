import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Toggle } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { BeaconMalfunctionVesselStatus, UserType, vesselStatuses } from '../../../domain/entities/beaconMalfunction'
import { setUserType } from '../../../domain/shared_slices/Global'
import saveBeaconMalfunctionCommentFromKanban from '../../../domain/use_cases/beaconMalfunction/saveBeaconMalfunctionCommentFromKanban'
import { getDate, getTime, mergeObjects } from '../../../utils'
import { ReactComponent as CommentsSVG } from '../../icons/Commentaires.svg'
import BeaconMalfunctionDetailsFollowUpItem from './BeaconMalfunctionDetailsFollowUpItem'
import BeaconMalfunctionDetailsFollowUpRow from './BeaconMalfunctionDetailsFollowUpRow'
import { getActionText } from './beaconMalfunctions'
import BeaconMalfunctionsDetailsFollowUpNotification from './BeaconMalfunctionsDetailsFollowUpNotification'

export const Type = {
  ACTION: 'ACTION',
  COMMENT: 'COMMENT',
  NOTIFICATION: 'NOTIFICATION',
}

function BeaconMalfunctionDetailsFollowUp({ beaconMalfunctionWithDetails, firstStatus, smallSize }) {
  const { actions, beaconMalfunction, comments, notifications } = beaconMalfunctionWithDetails
  const dispatch = useDispatch()
  const { userType } = useSelector(state => state.global)
  const vesselStatus = vesselStatuses.find(status => status.value === beaconMalfunction?.vesselStatus)
  const [today, setToday] = useState('')
  const [yesterday, setYesterday] = useState('')
  const scrollToRef = useRef('')
  const [comment, setComment] = useState('')
  const textareaRef = useRef(null)
  const [textareaHeight, setTextareaHeight] = useState(50)

  useEffect(() => {
    setToday(getDate(new Date().toISOString()))

    const yesterdayDate = new Date()
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    setYesterday(getDate(yesterdayDate.toISOString()))

    if (comments?.length) {
      setTimeout(() => {
        scrollToRef.current?.scrollIntoView({ block: 'nearest' })
      }, 500)
    }
  }, [comments])

  const getCommentOrActionDate = date => {
    if (date === today) {
      return "Aujourd'hui"
    }

    if (date === yesterday) {
      return 'Hier'
    }

    return date
  }

  const commentsByDate =
    comments?.reduce((commentsByDayAccumulated, comment) => {
      const dateWithoutTime = comment.dateTime.split('T')[0]
      comment = { ...comment, type: Type.COMMENT }

      if (commentsByDayAccumulated[dateWithoutTime]) {
        commentsByDayAccumulated[dateWithoutTime].push(comment)
      } else {
        commentsByDayAccumulated[dateWithoutTime] = [comment]
      }

      return commentsByDayAccumulated
    }, {}) || {}

  const actionsByDate =
    actions?.reduce((actionsByDayAccumulated, action) => {
      const dateWithoutTime = action.dateTime.split('T')[0]
      action = { ...action, type: Type.ACTION }

      if (actionsByDayAccumulated[dateWithoutTime]) {
        actionsByDayAccumulated[dateWithoutTime].push(action)
      } else {
        actionsByDayAccumulated[dateWithoutTime] = [action]
      }

      return actionsByDayAccumulated
    }, {}) || {}

  const notificationsByDate =
    notifications?.reduce((notificationsByDayAccumulated, notification) => {
      const dateWithoutTime = notification.dateTime.split('T')[0]
      notification = { ...notification, type: Type.NOTIFICATION }

      if (notificationsByDayAccumulated[dateWithoutTime]) {
        notificationsByDayAccumulated[dateWithoutTime].push(notification)
      } else {
        notificationsByDayAccumulated[dateWithoutTime] = [notification]
      }

      return notificationsByDayAccumulated
    }, {}) || {}

  const itemsByDate = mergeObjects(commentsByDate, mergeObjects(actionsByDate, notificationsByDate))

  useEffect(() => {
    if (comment?.length && textareaRef.current) {
      const { scrollHeight } = textareaRef.current
      textareaRef.current.style.height = scrollHeight > 50 ? scrollHeight : `${50}px`
    } else if (textareaRef.current) {
      textareaRef.current.style.height = '50px'
    }
    setTextareaHeight(textareaRef.current?.style?.height.replace('px', ''))
  }, [comment])

  const saveComment = () => {
    dispatch(saveBeaconMalfunctionCommentFromKanban(beaconMalfunction?.id, comment)).then(() => {
      setComment('')
    })
  }

  const getFirstStatusAction = (vesselStatus, malfunctionStartDateTime) => {
    if (
      vesselStatus?.value === BeaconMalfunctionVesselStatus.AT_PORT ||
      vesselStatus?.value === BeaconMalfunctionVesselStatus.AT_SEA
    ) {
      return `Avarie ${vesselStatus?.label?.replace(
        'Navire ',
        '',
      )} ouverte dans MonitorFish, dernière émission à ${getTime(malfunctionStartDateTime, true)}`
    }
    if (vesselStatus?.value === BeaconMalfunctionVesselStatus.NEVER_EMITTED) {
      return 'Avarie ouverte dans MonitorFish, aucune émission du navire à ce jour.'
    }
  }

  return (
    <Body style={bodyStyle(smallSize)}>
      <NumberComments style={numberCommentsStyle}>
        <CommentsIcon style={commentsIconStyle} />
        <NumberCommentsText
          data-cy="side-window-beacon-malfunctions-detail-comments-number"
          style={numberCommentsTextStyle}
        >
          {comments?.length} commentaire{comments?.length > 1 ? 's' : ''}
        </NumberCommentsText>
      </NumberComments>
      <CommentsAndActions className="smooth-scroll" style={commentsAndActionsStyle(smallSize, textareaHeight || 0)}>
        {firstStatus ? (
          <BeaconMalfunctionDetailsFollowUpRow
            date={beaconMalfunction?.malfunctionStartDateTime}
            dateText={getCommentOrActionDate(getDate(beaconMalfunction?.malfunctionStartDateTime))}
            index={0}
            smallSize={smallSize}
          >
            <BeaconMalfunctionDetailsFollowUpItem
              beaconMalfunction={beaconMalfunction?.endOfBeaconMalfunctionReason}
              contentText={getFirstStatusAction(vesselStatus, beaconMalfunction?.malfunctionStartDateTime)}
              isLast
              item={{
                dateTime: beaconMalfunction?.malfunctionStartDateTime,
                type: Type.ACTION,
              }}
              scrollToRef={scrollToRef}
            />
          </BeaconMalfunctionDetailsFollowUpRow>
        ) : null}
        {Object.keys(itemsByDate)
          .sort((a, b) => new Date(a) - new Date(b))
          .map((date, index) => {
            const isLastDate = Object.keys(itemsByDate).length === index + 1
            const dateText = getCommentOrActionDate(getDate(date))

            return (
              <BeaconMalfunctionDetailsFollowUpRow
                key={date}
                dateText={dateText}
                index={index}
                isLastDate={isLastDate}
                smallSize={smallSize}
              >
                {itemsByDate[date]
                  .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                  .map((item, index) => {
                    const isLast = itemsByDate[date].length === index + 1

                    return (
                      <BeaconMalfunctionDetailsFollowUpItem
                        key={item.type + item.dateTime}
                        beaconMalfunction={beaconMalfunction?.endOfBeaconMalfunctionReason}
                        contentText={getContent(item, beaconMalfunction)}
                        isLast={isLast}
                        isLastDate={isLastDate}
                        item={item}
                        scrollToRef={scrollToRef}
                      />
                    )
                  })}
              </BeaconMalfunctionDetailsFollowUpRow>
            )
          })}
      </CommentsAndActions>
      {!smallSize ? (
        <AddCommentRow style={addCommentRow}>
          <AddComment
            ref={textareaRef}
            data-cy="side-window-beacon-malfunctions-detail-comment-textarea"
            onChange={event => setComment(event.target.value)}
            style={addCommentStyle(userType)}
            value={comment}
          />
          <SubmitCommentRow style={submitCommentRowStyle}>
            Équipe SIP
            <Toggle
              onChange={checked => dispatch(setUserType(checked ? UserType.OPS : UserType.SIP))}
              size="sm"
              value={userType === UserType.OPS}
            />
            Équipe OPS
            <SubmitComment
              data-cy="side-window-beacon-malfunctions-detail-comment-add"
              disabled={!comment.replace(/\s/g, '').length}
              onClick={saveComment}
              style={submitCommentStyle}
            >
              Commenter
            </SubmitComment>
          </SubmitCommentRow>
        </AddCommentRow>
      ) : null}
    </Body>
  )
}

function getContent(item, beaconMalfunction) {
  switch (item?.type) {
    case Type.COMMENT:
      return item.comment
    case Type.ACTION:
      return getActionText(item, beaconMalfunction?.endOfBeaconMalfunctionReason)
    case Type.NOTIFICATION:
      return <BeaconMalfunctionsDetailsFollowUpNotification notification={item} />
  }
}

const AddCommentRow = styled.div``
const addCommentRow = {
  bottom: 20,
  position: 'absolute',
  width: 570,
}

const SubmitComment = styled.button``
const submitCommentStyle = {
  ':disabled': {
    background: COLORS.lightGray,
    border: `1px solid ${COLORS.lightGray}`,
    color: COLORS.white,
  },
  ':hover, :focus': {
    background: COLORS.charcoal,
  },
  background: COLORS.charcoal,
  color: COLORS.gainsboro,
  marginLeft: 'auto',
  padding: '6px 12px 6px 12px',
}

const SubmitCommentRow = styled.div``
const submitCommentRowStyle = {
  color: COLORS.slateGray,
  display: 'flex',
  font: 'normal normal normal 13px/18px Marianne',
  marginTop: 5,
  width: '100%',
}

const AddComment = styled.textarea``
const addCommentStyle = userType => ({
  background: `${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray} 0% 0% no-repeat padding-box`,
  border: '1px solid #9DC0D2',
  height: 50,
  marginBottom: 5,
  marginTop: 20,
  maxHeight: 150,
  padding: 5,
  width: '100%',
})

const CommentsAndActions = styled.div``
const commentsAndActionsStyle = (smallSize, textAreaHeight) => ({
  maxHeight: smallSize ? 410 : 560 - textAreaHeight,
  overflowX: 'hidden',
  overflowY: 'auto',
})

const NumberComments = styled.span``
const numberCommentsStyle = {
  color: COLORS.slateGray,
  display: 'inline-block',
  font: 'normal normal normal 11px/15px Marianne',
  letterSpacing: 0,
  marginBottom: 5,
  width: '100%',
}

const NumberCommentsText = styled.span``
const numberCommentsTextStyle = {
  float: 'right',
  marginRight: 5,
  position: 'relative',
  width: 'fit-content',
}

const Body = styled.div``
const bodyStyle = smallSize => ({
  marginBottom: smallSize ? 5 : 0,
  marginTop: smallSize ? 5 : 25,
  paddingLeft: smallSize ? 20 : 40,
  paddingRight: smallSize ? 15 : 40,
})

const CommentsIcon = styled(CommentsSVG)``
const commentsIconStyle = {
  float: 'right',
  marginTop: 2,
  position: 'relative',
  width: 'fit-content',
}

export default BeaconMalfunctionDetailsFollowUp
