import React, { useEffect, useRef, useState } from 'react'
import { COLORS } from '../../../constants/constants'
import styled from 'styled-components'
import { ReactComponent as CommentsSVG } from '../../icons/Commentaires.svg'
import { getDate, getTime } from '../../../utils'
import { Toggle } from 'rsuite'
import { basePrimaryButton } from '../../commonStyles/Buttons.style'
import { useDispatch, useSelector } from 'react-redux'
import { setUserType } from '../../../domain/shared_slices/Global'
import { UserType } from '../../../domain/entities/beaconStatus'
import saveBeaconStatusComment from '../../../domain/use_cases/saveBeaconStatusComment'

const BeaconStatusDetailsBody = ({ comments, beaconStatusId }) => {
  const dispatch = useDispatch()
  const {
    userType
  } = useSelector(state => state.global)
  const today = useRef('')
  const yesterday = useRef('')
  const scrollToRef = useRef('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!comments?.length) {
      setComment('')
    }

    if (comments?.length) {
      today.current = getDate(new Date().toISOString())

      const yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)

      yesterday.current = getDate(yesterdayDate.toISOString())

      setTimeout(() => {
        scrollToRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 500)
    }
  }, [comments])

  const getCommentDate = date => {
    if (date === today.current) {
      return 'Ajourd\'hui'
    }

    if (date === yesterday.current) {
      return 'Hier'
    }

    return date
  }

  const commentsByDate = comments?.reduce((commentsByDayAccumulated, comment) => {
    const dateWithoutTime = comment.dateTime.split('T')[0]

    if (commentsByDayAccumulated[dateWithoutTime]) {
      commentsByDayAccumulated[dateWithoutTime].push(comment)
    } else {
      commentsByDayAccumulated[dateWithoutTime] = [comment]
    }

    return commentsByDayAccumulated
  }, {}) || {}

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
          Object.keys(commentsByDate)
            .sort((a, b) => new Date(b.controlDatetimeUtc) - new Date(a.controlDatetimeUtc))
            .map((date, index) => {
              const isLastDate = Object.keys(commentsByDate).length === index + 1
              const dateText = getCommentDate(getDate(date))

              return <>
                <DateSeparator>
                  <Line/>
                  <CommentDate
                    isToday={dateText === 'Aujourd\'hui'}
                    isYesterday={dateText === 'Hier'}
                  >
                    {dateText}
                  </CommentDate>
                </DateSeparator>
                {
                  commentsByDate[date].map((comment, index) => {
                    const isLastComment = commentsByDate[date].length === index + 1

                    return <>
                      <CommentRow key={comment.id} ref={isLastDate && isLastComment ? scrollToRef : null}>
                        <CommentText>{comment.comment}</CommentText>
                      </CommentRow>
                      <CommentRow key={comment.id}>
                        <CommentUserType>{comment.userType} - {getTime(comment.dateTime, true)} (UTC)</CommentUserType>
                      </CommentRow>
                    </>
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

const CommentRow = styled.div`
  width: 100%;
  display: flex;
`

const CommentText = styled.div`
  background: #CCCFD6 0% 0% no-repeat padding-box;
  border: 1px solid #CCCFD6;
  max-width: 480px;
  padding: 10px 15px;
  margin-left: auto;
  margin-top: 10px;
`

const CommentUserType = styled.div`
  margin-left: auto;
  font: normal normal normal 11px/15px Marianne;
  color: ${COLORS.slateGray};
  margin-top: 2px;
`

const DateSeparator = styled.div`
  height: 20px;
  width: 100%;
  margin-top: 30px;
`

const CommentDate = styled.div`
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
