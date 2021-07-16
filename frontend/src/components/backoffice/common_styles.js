import styled from 'styled-components'
import { COLORS } from '../../constants/constants'
import { Input } from 'rsuite'
import { BlackButton, WhiteButton } from '../commonStyles/Buttons.style'

export const ContentLine = styled.div`
  display: flex;
  flex-direction : ${props => props.isFormOpened && props.isInfoTextShown ? 'column' : 'row'};
  align-items: ${props => props.isFormOpened && props.isInfoTextShown ? 'flex-start' : 'center'};
  margin-bottom: 8px;
`

export const Label = styled.span`
text-align: left;
color: ${COLORS.textGray};
min-width: 154px;
font-size: 13px;
margin-right: 8px;
`

export const CustomInput = styled(Input)`
  font-size: 11px;
  height: 35px;
  ${props => props.width ? '' : 'min-width: 100px;'}
  ${props => props.width ? `width: ${props.width};` : ''}
  ${props => props.isRed ? `border-color: ${COLORS.red};` : ''}
  margin: 0px 10px 0px 0px;
  padding: 8px;
`

export const ValidateButton = styled(BlackButton)`
  margin: 0px 10px 0px 0px;
`

export const CancelButton = styled(WhiteButton)`
  margin: 0px 10px 0px 0px;
`

export const RectangularButton = styled.a`
position: relative;
width: 35px;
height: 35px;
border: 1px solid ${COLORS.grayDarker};
border-radius: 2px;
color: ${COLORS.grayDarker};
margin-right: 8px;

&:after {
  content: "";  
  display: block;
  background-color: ${COLORS.grayDarker};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

&:before {
  content: "";  
  display: block;
  background-color: ${COLORS.grayDarker};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
&:before {
  height: 15px;
  width: 1.5px;
}
&:after {
  height: 1.5px;
  width: 15px;
}
`
