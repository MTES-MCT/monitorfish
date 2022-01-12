import React, { useState } from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'

const InfoBox = props => {
  const {
    isInfoTextShown,
    setIsInfoTextShown,
    isFormOpened,
    pointer,
    className,
    children
  } = props

  const [isShown, setIsShown] = useState(isInfoTextShown !== undefined ? isInfoTextShown : false)

  const onMouseLeave = () => {
    if (!isFormOpened) {
      changeDisplayStatus(false)
    }
  }

  const changeDisplayStatus = (status) => {
    if (setIsInfoTextShown) {
      setIsInfoTextShown(status)
    }
    setIsShown(status)
  }
  return (
    <InfoTextParent
      isInfoTextShown={isShown}
      isFormOpened={isFormOpened}
      onMouseLeave={onMouseLeave}
      pointer={pointer}
      className={className}
    >
      {isShown || isFormOpened
        ? <InfoTextWrapper
          isInfoTextShown={isShown}
          isFormOpened={isFormOpened}
          onMouseLeave={onMouseLeave}
          >
          <InfoPoint
            isInfoTextShown={isShown || isFormOpened}
          >!</InfoPoint>
          {children}
        </InfoTextWrapper>
        : <InfoPoint
          onMouseEnter={() => changeDisplayStatus(true)}
          onMouseOut={() => changeDisplayStatus(true)}
        >!</InfoPoint>}
    </InfoTextParent>)
}

const InfoTextParent = styled.div`
  display: flex;
  min-height: 14px;
  min-width: 14px;
  position: relative;
  cursor: ${props => props.pointer ? 'pointer' : 'default'};
  ${props => props.isFormOpened ? 'left: 384px' : ''};
  ${props => props.isFormOpened ? 'margin-top: 8px' : ''};
`

const InfoTextWrapper = styled.div`
  display: flex;
  ${props => props.isFormOpened ? '' : 'position: absolute;'};
  border: 1px solid ${COLORS.lightGray};
  background: ${COLORS.gainsboro} 0% 0% no-repeat padding-box;
  border-radius: 2px;
  padding: 8px 20px 9px 8px;
  ${props => props.isInfoTextShown && !props.isFormOpened ? 'margin-top: -10px;' : ''}
  box-sizing: border-box;
  z-index: 30;
`

const InfoPoint = styled.a`
  display: inline-block;
  align-self: start;
  min-height: 14px;
  min-width: 14px;
  height: 14px;
  width: 14px;
  border-radius: 50%;
  ${props => props.isInfoTextShown ? 'margin-top: 3px;' : ''}
  background: ${props => props.isInfoTextShown ? COLORS.charcoal : COLORS.slateGray} 0% 0% no-repeat padding-box;
  color: ${COLORS.white};
  text-align: center;
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  line-height: 12px;
  &:hover {
    text-decoration: none;
    color: ${COLORS.white};
  }
  &:focus {
    text-decoration: none;
    background-color: ${COLORS.charcoal};
  }
`

export default InfoBox
