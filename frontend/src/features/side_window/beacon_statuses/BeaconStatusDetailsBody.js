import React, { useEffect, useRef, useState } from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as CommentsSVG } from '../../icons/Commentaires.svg'
import { getDate, getTime, mergeObjects } from '../../../utils'
import { Toggle } from 'rsuite'
import { basePrimaryButton } from '../../commonStyles/Buttons.style'
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

  useEffect(() => {
    if (!comments?.length) {
      setComment('')
    }

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
      return 'Ajourd\'hui'
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
      return <div key={actionOrComment.type + actionOrComment.dateTime}>
        <ActionOrCommentRow ref={isLastDate && isLast ? scrollToRef : null}>
          <CommentText>{actionOrComment.comment}</CommentText>
        </ActionOrCommentRow>
        <ActionOrCommentRow>
          <CommentUserType>{actionOrComment.userType} - {getTime(actionOrComment.dateTime, true)} (UTC)</CommentUserType>
        </ActionOrCommentRow>
      </div>
    } else if (actionOrComment.type === Type.ACTION) {
      return <div key={actionOrComment.type + actionOrComment.dateTime}>
        <ActionOrCommentRow ref={isLastDate && isLast ? scrollToRef : null}>
          <ActionText>{getActionText(actionOrComment)}</ActionText>
        </ActionOrCommentRow>
        <ActionOrCommentRow>
          <CommentUserType>{getTime(actionOrComment.dateTime, true)} (UTC)</CommentUserType>
        </ActionOrCommentRow>
      </div>
    }
  }

  const saveComment = () => {
    dispatch(saveBeaconStatusComment(beaconStatusId, comment)).then(() => {
      setComment('')
    })
  }

  return (
    <Body>
      <NumberComments>
        <CommentsIcon/>
        <NumberCommentsText>
          {comments?.length} commentaires
        </NumberCommentsText>
      </NumberComments>
      <Comments>
        {
          Object.keys(actionsAndCommentsByDate)
            .sort((a, b) => new Date(a) - new Date(b))
            .map((date, index) => {
              const isLastDate = Object.keys(actionsAndCommentsByDate).length === index + 1
              const dateText = getCommentOrActionDate(getDate(date))

              return <>
                <DateSeparator>
                  <Line/>
                  <RowDate
                    isToday={dateText === 'Aujourd\'hui'}
                    isYesterday={dateText === 'Hier'}
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
        value={comment}
        onChange={event => setComment(event.target.value)}
      />
      <SubmitCommentRow>
        Équipe SIP
        <Toggle
          value={userType === UserType.OPS}
          onChange={checked => dispatch(setUserType(checked ? UserType.OPS : UserType.SIP))}
          size="sm"
        />
        Équipe OPS
        <SubmitComment
          onClick={saveComment}
        >
          Commenter
        </SubmitComment>
      </SubmitCommentRow>
    </Body>
  )
}

const SubmitComment = styled.button`
  ${basePrimaryButton}
  margin-left: auto;
  padding: 6px 12px 6px 12px;
`

const SubmitCommentRow = styled.div`
  margin-top: 5px;
  width: 100%;
  display: flex;
  font: normal normal normal 13px/18px Marianne;
  color: ${COLORS.slateGray};
  
  .rs-btn-toggle {
    background: #C8DCE6 0% 0% no-repeat padding-box;
    border: 1px solid #707785;
    border-radius: 7px;
    margin: 3px 7px 0 7px;
  }
  .rs-btn-toggle::after {
    background: ${COLORS.slateGray} 0% 0% no-repeat padding-box;
    top: 1px;
  }
}
`

const AddComment = styled.textarea`
  width: 100%;
  background: #C8DCE6 0% 0% no-repeat padding-box;
  border: 1px solid #9DC0D2;
  margin-top: 20px;
  margin-bottom: 5px;
  padding: 5px;
  height: 50px;
`

const ActionOrCommentRow = styled.div`
  width: 100%;
  display: flex;
`

const CommentText = styled.div`
  background: ${COLORS.lightGray} 0% 0% no-repeat padding-box;
  border: 1px solid ${COLORS.lightGray};
  max-width: 480px;
  padding: 10px 15px;
  margin-top: 10px;
`

const ActionText = styled.div`
  border: 2px solid ${COLORS.lightGray};
  max-width: 480px;
  padding: 10px 15px;
  margin-top: 10px;
`

const CommentUserType = styled.div`
  font: normal normal normal 11px/15px Marianne;
  color: ${COLORS.slateGray};
  margin-top: 2px;
`

const DateSeparator = styled.div`
  height: 20px;
  width: 100%;
  margin-top: 30px;
`

const RowDate = styled.div`
  margin-top: -23px;
  width: fit-content;
  background: white;
  padding: 10px;
  ${props => props.isToday
    ? 'margin-left: calc(50% - 45px);'
    : props.isYesterday
      ? 'margin-left: calc(50% - 23px);'
      : 'margin-left: calc(50% - 43px);'
  } 
  color: ${COLORS.slateGray};
`

const Comments = styled.div`
  max-height: 530px;
  overflow-y: auto;
`

const NumberComments = styled.span`
  font: normal normal normal 11px/15px Marianne;
  letter-spacing: 0px;
  color: ${COLORS.slateGray};
  display: inline-block;
  width: 100%;
`

const NumberCommentsText = styled.span`
  position: relative;
  width: fit-content;
  float: right;
  margin-right: 5px;
`

const Body = styled.div`
  margin-top: 20px;
  padding-right: 40px;
  padding-left: 40px;
`

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid ${COLORS.lightGray};
`

const CommentsIcon = styled(CommentsSVG)`
  width: 20px;
  position: relative;
  width: fit-content;
  float: right;
  margin-top: 2px;
`

export default BeaconStatusDetailsBody
