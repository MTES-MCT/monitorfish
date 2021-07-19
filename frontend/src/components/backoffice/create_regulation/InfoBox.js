import React from 'react'
import styled from 'styled-components'
import { COLORS, INFO_TEXT } from '../../../constants/constants'

const InfoBox = props => {
  const {
    isInfoTextShown,
    setIsInfoTextShown,
    isFormOpened,
    message
  } = props
  return (
    <InfoTextParent
      isInfoTextShown={isInfoTextShown}
      isFormOpened={isFormOpened}
      onMouseLeave={() => !isFormOpened && setIsInfoTextShown(false)}
    >
      {isInfoTextShown
        ? <InfoTextWrapper
          isFormOpened={isFormOpened}
          onMouseLeave={() => !isFormOpened && setIsInfoTextShown(false)}
          >
          <InfoPoint>!</InfoPoint>
          <InfoText>
            {INFO_TEXT[message]}
          </InfoText>
        </InfoTextWrapper>
        : <InfoPoint
          onMouseEnter={() => setIsInfoTextShown(true)}
          onMouseOut={() => setIsInfoTextShown(false)}
        >!</InfoPoint>}
    </InfoTextParent>)
}

const InfoTextParent = styled.div`
  display: flex;
  min-height: 20px;
  min-width: 20px;
  position: relative;
  ${props => props.isFormOpened && props.isInfoTextShown ? 'left: 352px' : ''};
`

const InfoTextWrapper = styled.div`
  display: flex;
  ${props => props.isFormOpened ? '' : 'position: absolute;'};
  border: 1px solid ${COLORS.grayDarker};
  background: ${COLORS.grayBackground} 0% 0% no-repeat padding-box;
  border-radius: 2px;
  min-width: 560px;
  max-width: 600px;
  padding: 8px;
  box-sizing: border-box;
  z-index: 30;
  top: '-6px';
  left: '0';
`

const InfoText = styled.span`
  align-self: center;
  display: 'flex';
  font-size: 13px;
  color: ${COLORS.textGray};
  padding-left: 8px;
`

const InfoPoint = styled.a`
  display: inline-block;
  align-self: start;
  min-height: 20px;
  min-width: 20px;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: ${COLORS.grayDarkerThree} 0% 0% no-repeat padding-box;
  color: ${COLORS.grayBackground};
  text-align: center;
  font: normal normal bold 13px Arial;
  text-align: center;
  line-height: 20px;
  &:hover {
    text-decoration: none;
    color: ${COLORS.grayBackground};
  }
  &:focus {
    text-decoration: none;
    color: ${COLORS.grayBackground};
  }
`

export default InfoBox
