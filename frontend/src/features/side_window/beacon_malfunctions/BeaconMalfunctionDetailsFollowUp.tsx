import { CSSProperties, useEffect, useRef, useState } from 'react'
import { Toggle } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../constants/constants'
import { BeaconMalfunctionVesselStatus, UserType, vesselStatuses } from '../../../domain/entities/beaconMalfunction'
import { setUserType } from '../../../domain/shared_slices/Global'
import saveBeaconMalfunctionCommentFromKanban from '../../../domain/use_cases/beaconMalfunction/saveBeaconMalfunctionCommentFromKanban'
import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { getDate, getTime, mergeObjects } from '../../../utils'
import { ReactComponent as CommentsSVG } from '../../icons/Commentaires.svg'
import { BeaconMalfunctionDetailsFollowUpItem } from './BeaconMalfunctionDetailsFollowUpItem'
import { BeaconMalfunctionDetailsFollowUpRow } from './BeaconMalfunctionDetailsFollowUpRow'
import { BeaconMalfunctionDetailsType, getActionText } from './beaconMalfunctions'
import { BeaconMalfunctionsDetailsFollowUpNotification } from './BeaconMalfunctionsDetailsFollowUpNotification'

export function BeaconMalfunctionDetailsFollowUp({ beaconMalfunctionWithDetails, firstStatus, smallSize }) {
  const { actions, beaconMalfunction, comments, notifications } = beaconMalfunctionWithDetails
  const dispatch = useAppDispatch()
  const { userType } = useAppSelector(state => state.global)
  const vesselStatus = vesselStatuses.find(status => status.value === beaconMalfunction?.vesselStatus)
  const [today, setToday] = useState('')
  const [yesterday, setYesterday] = useState('')
  const scrollToRef = useRef<HTMLDivElement>(null)
  const [comment, setComment] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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
    comments?.reduce((commentsByDayAccumulated, _comment) => {
      const nextCommentsByDayAccumulated = { ...commentsByDayAccumulated }
      const nextComment = { ..._comment, type: BeaconMalfunctionDetailsType.COMMENT }

      const dateWithoutTime = _comment.dateTime.split('T')[0]
      if (nextCommentsByDayAccumulated[dateWithoutTime]) {
        nextCommentsByDayAccumulated[dateWithoutTime].push(nextComment)
      } else {
        nextCommentsByDayAccumulated[dateWithoutTime] = [nextComment]
      }

      return nextCommentsByDayAccumulated
    }, {}) || {}

  const actionsByDate =
    actions?.reduce((actionsByDayAccumulated, _action) => {
      const nextActionsByDayAccumulated = { ...actionsByDayAccumulated }
      const nextAction = { ..._action, type: BeaconMalfunctionDetailsType.ACTION }

      const dateWithoutTime = nextAction.dateTime.split('T')[0]
      if (nextActionsByDayAccumulated[dateWithoutTime]) {
        nextActionsByDayAccumulated[dateWithoutTime].push(nextAction)
      } else {
        nextActionsByDayAccumulated[dateWithoutTime] = [nextAction]
      }

      return nextActionsByDayAccumulated
    }, {}) || {}

  const notificationsByDate =
    notifications?.reduce((notificationsByDayAccumulated, _notification) => {
      const nextNotificationsByDayAccumulated = { ...notificationsByDayAccumulated }
      const nextNotification = { ..._notification, type: BeaconMalfunctionDetailsType.NOTIFICATION }

      const dateWithoutTime = nextNotification.dateTime.split('T')[0]
      if (nextNotificationsByDayAccumulated[dateWithoutTime]) {
        nextNotificationsByDayAccumulated[dateWithoutTime].push(nextNotification)
      } else {
        nextNotificationsByDayAccumulated[dateWithoutTime] = [nextNotification]
      }

      return nextNotificationsByDayAccumulated
    }, {}) || {}

  const itemsByDate = mergeObjects(commentsByDate, mergeObjects(actionsByDate, notificationsByDate))

  useEffect(() => {
    if (comment?.length && textareaRef.current) {
      const { scrollHeight } = textareaRef.current

      if (scrollHeight > 50) {
        textareaRef.current.style.height = `${scrollHeight}px`
      } else {
        textareaRef.current.style.height = `${50}px`
      }
    } else if (textareaRef.current) {
      textareaRef.current.style.height = '50px'
    }
    setTextareaHeight(parseInt(textareaRef.current?.style?.height.replace('px', '') || '', 10))
  }, [comment])

  const saveComment = () => {
    // @ts-ignore
    dispatch(saveBeaconMalfunctionCommentFromKanban(beaconMalfunction?.id, comment)).then(() => {
      setComment('')
    })
  }

  const getFirstStatusAction = (_vesselStatus, malfunctionStartDateTime) => {
    if (
      _vesselStatus?.value === BeaconMalfunctionVesselStatus.AT_PORT ||
      _vesselStatus?.value === BeaconMalfunctionVesselStatus.AT_SEA
    ) {
      return `Avarie ${_vesselStatus?.label?.replace(
        'Navire ',
        ''
      )} ouverte dans MonitorFish, dernière émission à ${getTime(malfunctionStartDateTime, true)}`
    }

    if (_vesselStatus?.value === BeaconMalfunctionVesselStatus.NEVER_EMITTED) {
      return 'Avarie ouverte dans MonitorFish, aucune émission du navire à ce jour.'
    }

    return ''
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
            dateText={getCommentOrActionDate(getDate(beaconMalfunction?.malfunctionStartDateTime))}
            index={0}
            smallSize={smallSize}
          >
            <BeaconMalfunctionDetailsFollowUpItem
              contentText={getFirstStatusAction(vesselStatus, beaconMalfunction?.malfunctionStartDateTime)}
              isLast
              isLastDate={!itemsByDate?.length}
              item={{
                dateTime: beaconMalfunction?.malfunctionStartDateTime,
                type: BeaconMalfunctionDetailsType.ACTION
              }}
              scrollToRef={scrollToRef}
            />
          </BeaconMalfunctionDetailsFollowUpRow>
        ) : null}
        {Object.keys(itemsByDate)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          .map((date, dateIndex) => {
            const isLastDate = Object.keys(itemsByDate).length === dateIndex + 1
            const dateText = getCommentOrActionDate(getDate(date))

            return (
              <BeaconMalfunctionDetailsFollowUpRow
                key={date}
                dateText={dateText}
                index={dateIndex}
                smallSize={smallSize}
              >
                {itemsByDate[date]
                  .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                  .map((item, dateItemIndex) => {
                    const isLast = itemsByDate[date].length === dateItemIndex + 1

                    return (
                      <BeaconMalfunctionDetailsFollowUpItem
                        key={item.type + item.dateTime}
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
              checked={userType === UserType.OPS}
              onChange={checked => dispatch(setUserType(checked ? UserType.OPS : UserType.SIP))}
              size="sm"
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
    case BeaconMalfunctionDetailsType.COMMENT:
      return item.comment
    case BeaconMalfunctionDetailsType.ACTION:
      return getActionText(item, beaconMalfunction?.endOfBeaconMalfunctionReason)
    case BeaconMalfunctionDetailsType.NOTIFICATION:
      return <BeaconMalfunctionsDetailsFollowUpNotification notification={item} />
    default:
      throw new Error('This should never happen.')
  }
}

const AddCommentRow = styled.div``
const addCommentRow: CSSProperties = {
  bottom: 20,
  position: 'absolute',
  width: 570
}

const SubmitComment = styled.button``
const submitCommentStyle = {
  ':disabled': {
    background: COLORS.lightGray,
    border: `1px solid ${COLORS.lightGray}`,
    color: COLORS.white
  },
  ':hover, :focus': {
    background: COLORS.charcoal
  },
  background: COLORS.charcoal,
  color: COLORS.gainsboro,
  marginLeft: 'auto',
  padding: '6px 12px 6px 12px'
}

const SubmitCommentRow = styled.div``
const submitCommentRowStyle = {
  color: COLORS.slateGray,
  display: 'flex',
  font: 'normal normal normal 13px/18px Marianne',
  marginTop: 5,
  width: '100%'
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
  width: '100%'
})

const CommentsAndActions = styled.div``
const commentsAndActionsStyle: (isSmall: boolean, textAreaHeight: number) => CSSProperties = (
  smallSize,
  textAreaHeight
) => ({
  maxHeight: smallSize ? 410 : 560 - textAreaHeight,
  overflowX: 'hidden',
  overflowY: 'auto'
})

const NumberComments = styled.span``
const numberCommentsStyle = {
  color: COLORS.slateGray,
  display: 'inline-block',
  font: 'normal normal normal 11px/15px Marianne',
  letterSpacing: 0,
  marginBottom: 5,
  width: '100%'
}

const NumberCommentsText = styled.span``
const numberCommentsTextStyle: CSSProperties = {
  float: 'right',
  marginRight: 5,
  position: 'relative',
  width: 'fit-content'
}

const Body = styled.div``
const bodyStyle = smallSize => ({
  marginBottom: smallSize ? 5 : 0,
  marginTop: smallSize ? 5 : 25,
  paddingLeft: smallSize ? 20 : 40,
  paddingRight: smallSize ? 15 : 40
})

const CommentsIcon = styled(CommentsSVG)``
const commentsIconStyle: CSSProperties = {
  float: 'right',
  marginTop: 2,
  position: 'relative',
  width: 'fit-content'
}
