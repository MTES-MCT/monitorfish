import React, { useEffect, useRef, useState } from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as CommentsSVG } from '../../icons/Commentaires.svg'
import { getDate, getTime, mergeObjects } from '../../../utils'
import { Toggle } from 'rsuite'
import { useDispatch, useSelector } from 'react-redux'
import { setUserType } from '../../../domain/shared_slices/Global'
import { BeaconMalfunctionVesselStatus, UserType, vesselStatuses } from '../../../domain/entities/beaconMalfunction'
import saveBeaconMalfunctionCommentFromKanban from '../../../domain/use_cases/beaconMalfunction/saveBeaconMalfunctionCommentFromKanban'
import BeaconMalfunctionDetailsFollowUpRow from './BeaconMalfunctionDetailsFollowUpRow'
import BeaconMalfunctionDetailsFollowUpCommentOrAction from './BeaconMalfunctionDetailsFollowUpCommentOrAction'
import { getActionText } from './beaconMalfunctions'

export const Type = {
  ACTION: 'ACTION',
  COMMENT: 'COMMENT'
}

const BeaconMalfunctionDetailsFollowUp = ({ beaconMalfunctionWithDetails, smallSize, firstStatus }) => {
  const {
    actions,
    comments,
    beaconMalfunction
  } = beaconMalfunctionWithDetails
  const dispatch = useDispatch()
  const {
    userType
  } = useSelector(state => state.global)
  const vesselStatus = vesselStatuses.find(status => status.value === beaconMalfunction?.vesselStatus)
  const [today, setToday] = useState('')
  const [yesterday, setYesterday] = useState('')
  const scrollToRef = useRef('')
  const [comment, setComment] = useState('')
  const textareaRef = useRef(null)
  const [textareaHeight, setTextareaHeight] = useState(50)

  useEffect(() => {
    if (comments?.length) {
      setToday(getDate(new Date().toISOString()))

      const yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)
      setYesterday(getDate(yesterdayDate.toISOString()))

      setTimeout(() => {
        scrollToRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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

  useEffect(() => {
    if (comment?.length && textareaRef.current) {
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = scrollHeight > 50 ? scrollHeight : 50 + 'px'
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
    if (vesselStatus?.value === BeaconMalfunctionVesselStatus.AT_PORT || vesselStatus?.value === BeaconMalfunctionVesselStatus.AT_SEA) {
      return `Avarie ${vesselStatus?.label?.replace('Navire ', '')} ouverte dans MonitorFish, dernière émission à ${getTime(malfunctionStartDateTime, true)}`
    } else if (vesselStatus?.value === BeaconMalfunctionVesselStatus.NEVER_EMITTED) {
      return 'Avarie ouverte dans MonitorFish, aucune émission du navire à ce jour.'
    }
  }

  return (
    <Body style={bodyStyle(smallSize)}>
      <NumberComments style={numberCommentsStyle}>
        <CommentsIcon style={commentsIconStyle}/>
        <NumberCommentsText
          data-cy={'side-window-beacon-malfunctions-detail-comments-number'}
          style={numberCommentsTextStyle}
        >
          {comments?.length} commentaire{comments?.length > 1 ? 's' : ''}
        </NumberCommentsText>
      </NumberComments>
      <CommentsAndActions style={commentsAndActionsStyle(smallSize, textareaHeight || 0)}>
        {
          firstStatus
            ? <BeaconMalfunctionDetailsFollowUpRow
              index={0}
              smallSize={smallSize}
              date={beaconMalfunction?.malfunctionStartDateTime}
              dateText={getCommentOrActionDate(getDate(beaconMalfunction?.malfunctionStartDateTime))}
            >
              <BeaconMalfunctionDetailsFollowUpCommentOrAction
                actionOrComment={{
                  type: Type.ACTION,
                  dateTime: beaconMalfunction?.malfunctionStartDateTime
                }}
                contentText={getFirstStatusAction(vesselStatus, beaconMalfunction?.malfunctionStartDateTime)}
                scrollToRef={scrollToRef}
                isLast
                beaconMalfunction={beaconMalfunction?.endOfBeaconMalfunctionReason}
              />
            </BeaconMalfunctionDetailsFollowUpRow>
            : null
        }
        {
          Object.keys(actionsAndCommentsByDate)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((date, index) => {
              const isLastDate = Object.keys(actionsAndCommentsByDate).length === index + 1
              const dateText = getCommentOrActionDate(getDate(date))

              return <BeaconMalfunctionDetailsFollowUpRow
                key={date}
                index={index}
                smallSize={smallSize}
                isLastDate={isLastDate}
                dateText={dateText}
              >
                {
                  actionsAndCommentsByDate[date]
                    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
                    .map((actionOrComment, index) => {
                      const isLast = actionsAndCommentsByDate[date].length === index + 1

                      return <BeaconMalfunctionDetailsFollowUpCommentOrAction
                        key={actionOrComment.type + actionOrComment.dateTime}
                        actionOrComment={actionOrComment}
                        contentText={actionOrComment?.type === Type.COMMENT
                          ? actionOrComment.comment
                          : getActionText(actionOrComment, beaconMalfunction?.endOfBeaconMalfunctionReason)}
                        scrollToRef={scrollToRef}
                        isLastDate={isLastDate}
                        isLast={isLast}
                        beaconMalfunction={beaconMalfunction?.endOfBeaconMalfunctionReason}
                      />
                    })
                }
              </BeaconMalfunctionDetailsFollowUpRow>
            })
        }
      </CommentsAndActions>
      {
        !smallSize
          ? <AddCommentRow style={addCommentRow}>
            <AddComment
              data-cy={'side-window-beacon-malfunctions-detail-comment-textarea'}
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
                data-cy={'side-window-beacon-malfunctions-detail-comment-add'}
                disabled={!comment.replace(/\s/g, '').length}
                style={submitCommentStyle}
                onClick={saveComment}
              >
                Commenter
              </SubmitComment>
            </SubmitCommentRow>
          </AddCommentRow>
          : null
      }
    </Body>
  )
}

const AddCommentRow = styled.div``
const addCommentRow = {
  bottom: 20,
  position: 'absolute',
  width: 570
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
  border: '1px solid #9DC0D2',
  marginTop: 20,
  marginBottom: 5,
  padding: 5,
  height: 50,
  maxHeight: 150
})

const CommentsAndActions = styled.div``
const commentsAndActionsStyle = (smallSize, textAreaHeight) => ({
  maxHeight: smallSize ? 410 : (600 - textAreaHeight),
  overflowY: 'auto',
  overflowX: 'hidden'
})

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
const bodyStyle = smallSize => ({
  marginTop: smallSize ? 5 : 25,
  marginBottom: smallSize ? 5 : 0,
  paddingRight: smallSize ? 15 : 40,
  paddingLeft: smallSize ? 20 : 40
})

const CommentsIcon = styled(CommentsSVG)``
const commentsIconStyle = {
  position: 'relative',
  width: 'fit-content',
  float: 'right',
  marginTop: 2
}

export default BeaconMalfunctionDetailsFollowUp
