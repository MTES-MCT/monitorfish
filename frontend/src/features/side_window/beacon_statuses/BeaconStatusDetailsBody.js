import React, { useEffect, useRef, useState } from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as CommentsSVG } from '../../icons/Commentaires.svg'
import { getDate, getTime, mergeObjects } from '../../../utils'
import { Toggle } from 'rsuite'
import { useDispatch, useSelector } from 'react-redux'
import { setUserType } from '../../../domain/shared_slices/Global'
import { UserType } from '../../../domain/entities/beaconStatus'
import saveBeaconStatusComment from '../../../domain/use_cases/saveBeaconStatusComment'
import { beaconStatusesStages, vesselStatuses } from './beaconStatuses'

const Type = {
  ACTION: 'ACTION',
  COMMENT: 'COMMENT'
}

const ActionProperty = {
  VESSEL_STATUS: 'VESSEL_STATUS',
  STAGE: 'STAGE'
}

const BeaconStatusDetailsBody = ({ comments, actions, beaconStatusId }) => {
  const dispatch = useDispatch()
  const {
    userType
  } = useSelector(state => state.global)
  const [today, setToday] = useState('')
  const [yesterday, setYesterday] = useState('')
  const scrollToRef = useRef('')
  const [comment, setComment] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (comments?.length) {
      setToday(getDate(new Date().toISOString()))

      const yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
      setYesterday(getDate(yesterdayDate.toISOString()))

      setTimeout(() => {
        scrollToRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 500)
    }
  }, [comments])

  const getCommentOrActionDate = date => {
    if (date === today) {
      return 'Aujourd\'hui'
    }

    if (date === yesterday) {
      return 'Hier'
    }

    return date
  }

  const commentsByDate = comments?.reduce((commentsByDayAccumulated, comment) => {
    const dateWithoutTime = comment.dateTime.split('T')[0]
    comment = { ...comment, type: Type.COMMENT }

    if (commentsByDayAccumulated[dateWithoutTime]) {
      commentsByDayAccumulated[dateWithoutTime].push(comment)
    } else {
      commentsByDayAccumulated[dateWithoutTime] = [comment]
    }

    return commentsByDayAccumulated
  }, {}) || {}

  const actionsByDate = actions?.reduce((actionsByDayAccumulated, action) => {
    const dateWithoutTime = action.dateTime.split('T')[0]
    action = { ...action, type: Type.ACTION }

    if (actionsByDayAccumulated[dateWithoutTime]) {
      actionsByDayAccumulated[dateWithoutTime].push(action)
    } else {
      actionsByDayAccumulated[dateWithoutTime] = [action]
    }

    return actionsByDayAccumulated
  }, {}) || {}

  const actionsAndCommentsByDate = mergeObjects(commentsByDate, actionsByDate)

  const getActionText = action => {
    if (action.propertyName === ActionProperty.VESSEL_STATUS) {
      const previousValue = vesselStatuses.find(status => status.value === action.previousValue)?.label
      const nextValue = vesselStatuses.find(status => status.value === action.nextValue)?.label

      return <>Le statut du ticket a été modifié, de <b>{previousValue}</b> à <b>{nextValue}</b>.</>
    } else if (action.propertyName === ActionProperty.STAGE) {
      const previousValue = beaconStatusesStages[action.previousValue].title
      const nextValue = beaconStatusesStages[action.nextValue].title

      return <>Le ticket a été déplacé de <b>{previousValue}</b> à <b>{nextValue}</b>.</>
    }
  }

  const getActionOrCommentRow = (actionOrComment, isLastDate, isLast) => {
    if (actionOrComment.type === Type.COMMENT) {
      return <div
        data-cy={'side-window-beacon-statuses-detail-comment-content'}
        key={actionOrComment.type + actionOrComment.dateTime}
      >
        <ActionOrCommentRow style={actionOrCommentRow} ref={isLastDate && isLast ? scrollToRef : null}>
          <CommentText style={commentTextStyle(actionOrComment.userType)}>{actionOrComment.comment}</CommentText>
        </ActionOrCommentRow>
        <ActionOrCommentRow style={actionOrCommentRow}>
          <CommentUserType style={commentUserTypeStyle}>{actionOrComment.userType} - {getTime(actionOrComment.dateTime, true)} (UTC)</CommentUserType>
        </ActionOrCommentRow>
      </div>
    } else if (actionOrComment.type === Type.ACTION) {
      return <div
        data-cy={'side-window-beacon-statuses-detail-action-content'}
        key={actionOrComment.type + actionOrComment.dateTime}
      >
        <ActionOrCommentRow style={actionOrCommentRow} ref={isLastDate && isLast ? scrollToRef : null}>
          <ActionText style={actionTextStyle}>{getActionText(actionOrComment)}</ActionText>
        </ActionOrCommentRow>
        <ActionOrCommentRow style={actionOrCommentRow}>
          <CommentUserType style={commentUserTypeStyle}>{getTime(actionOrComment.dateTime, true)} (UTC)</CommentUserType>
        </ActionOrCommentRow>
      </div>
    }
  }

  useEffect(() => {
    if (comment?.length && textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight > 50 ? scrollHeight : 50 + 'px'
    } else if (textareaRef.current) {
      textareaRef.current.style.height = '50px'
    }
  }, [comment])

  const saveComment = () => {
    dispatch(saveBeaconStatusComment(beaconStatusId, comment)).then(() => {
      setComment('')
    })
  }

  return (
    <Body style={bodyStyle}>
      <NumberComments style={numberCommentsStyle}>
        <CommentsIcon style={commentsIconStyle}/>
        <NumberCommentsText
          data-cy={'side-window-beacon-statuses-detail-comments-number'}
          style={numberCommentsTextStyle}
        >
          {comments?.length} commentaire{comments?.length > 1 ? 's' : ''}
        </NumberCommentsText>
      </NumberComments>
      <Comments style={commentsStyle}>
        {
          Object.keys(actionsAndCommentsByDate)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((date, index) => {
              const isLastDate = Object.keys(actionsAndCommentsByDate).length === index + 1
              const dateText = getCommentOrActionDate(getDate(date))

              return <>
                <DateSeparator
                  data-cy={'side-window-beacon-statuses-detail-comment-date'}
                  style={dateSeparatorStyle(index === 0)}
                >
                  <Line style={lineStyle}/>
                  <RowDate
                    style={rowDateStyle(
                      dateText === 'Aujourd\'hui',
                      dateText === 'Hier')}
                  >
                    {dateText}
                  </RowDate>
                </DateSeparator>
                {
                  actionsAndCommentsByDate[date]
                    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                    .map((actionOrComment, index) => {
                      const isLast = actionsAndCommentsByDate[date].length === index + 1

                      return getActionOrCommentRow(actionOrComment, isLastDate, isLast)
                    })
                }
              </>
            })
        }
      </Comments>
      <AddComment
        data-cy={'side-window-beacon-statuses-detail-comment-textarea'}
        style={addCommentStyle(userType)}
        value={comment}
        onChange={event => setComment(event.target.value)}
        ref={textareaRef}
      />
      <SubmitCommentRow style={submitCommentRowStyle}>
        Équipe SIP
        <Toggle
          style={{ background: `${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray}` }}
          value={userType === UserType.OPS}
          onChange={checked => dispatch(setUserType(checked ? UserType.OPS : UserType.SIP))}
          size="sm"
        />
        Équipe OPS
        <SubmitComment
          data-cy={'side-window-beacon-statuses-detail-comment-add'}
          disabled={!comment.replace(/\s/g, '').length}
          style={submitCommentStyle}
          onClick={saveComment}
        >
          Commenter
        </SubmitComment>
      </SubmitCommentRow>
    </Body>
  )
}

const SubmitComment = styled.button``
const submitCommentStyle = {
  background: COLORS.charcoal,
  color: COLORS.gainsboro,
  marginLeft: 'auto',
  padding: '6px 12px 6px 12px',
  ':hover, :focus': {
    background: COLORS.charcoal
  },
  ':disabled': {
    border: `1px solid ${COLORS.lightGray}`,
    background: COLORS.lightGray,
    color: COLORS.white
  }
}

const SubmitCommentRow = styled.div``
const submitCommentRowStyle = {
  marginTop: 5,
  width: '100%',
  display: 'flex',
  font: 'normal normal normal 13px/18px Marianne',
  color: COLORS.slateGray
}

const AddComment = styled.textarea``
const addCommentStyle = userType => ({
  width: '100%',
  background: `${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray} 0% 0% no-repeat padding-box`,
  border: `1px solid ${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray}`,
  marginTop: 20,
  marginBottom: 5,
  padding: 5,
  height: 50,
  maxHeight: 150
})

const ActionOrCommentRow = styled.div``
const actionOrCommentRow = {
  width: '100%',
  display: 'flex'
}

const CommentText = styled.div``
const commentTextStyle = userType => ({
  background: `${userType === UserType.OPS ? '#C8DCE6' : COLORS.lightGray} 0% 0% no-repeat padding-box`,
  border: `1px solid ${COLORS.lightGray}`,
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

const DateSeparator = styled.div``
const dateSeparatorStyle = first => ({
  height: 20,
  width: 558,
  marginTop: first ? 10 : 30
})

const RowDate = styled.div``
const rowDateStyle = (isToday, isYesterday) => ({
  marginTop: -23,
  width: 'fit-content',
  background: 'white',
  padding: 10,
  marginLeft: isToday
    ? 'calc(50% - 45px)'
    : isYesterday
      ? 'calc(50% - 23px)'
      : 'calc(50% - 43px)',
  color: COLORS.slateGray
})

const Comments = styled.div``
const commentsStyle = {
  maxHeight: 435,
  overflowY: 'auto',
  overflowX: 'hidden'
}

const NumberComments = styled.span``
const numberCommentsStyle = {
  font: 'normal normal normal 11px/15px Marianne',
  letterSpacing: 0,
  color: COLORS.slateGray,
  display: 'inline-block',
  width: '100%',
  marginBottom: 5
}

const NumberCommentsText = styled.span``
const numberCommentsTextStyle = {
  position: 'relative',
  width: 'fit-content',
  float: 'right',
  marginRight: 5
}

const Body = styled.div``
const bodyStyle = {
  marginTop: 25,
  paddingRight: 40,
  paddingLeft: 40
}

const Line = styled.div``
const lineStyle = {
  width: 558,
  borderBottom: `1px solid ${COLORS.lightGray}`
}

const CommentsIcon = styled(CommentsSVG)``
const commentsIconStyle = {
  position: 'relative',
  width: 'fit-content',
  float: 'right',
  marginTop: 2
}

export default BeaconStatusDetailsBody
