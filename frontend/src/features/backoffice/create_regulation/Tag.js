import React from 'react'
import styled from 'styled-components'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { COLORS } from '../../../constants/constants'
import { Link } from '../../commonStyles/Backoffice.style'

const Tag = props => {
  const {
    selectedValue,
    onCloseIconClicked,
    selectedURL
  } = props

  return <TagWrapper>
    {!selectedURL
      ? <SelectedValue>{selectedValue}</SelectedValue>
      : <Link
          href={selectedURL}
          target={'_blank'}
        >{selectedValue}</Link>
    }
    <CloseIcon onClick={_ => onCloseIconClicked(selectedValue)}/>
  </TagWrapper>
}

// TODO Revoir la couleur
const TagWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${COLORS.gainsboro};
  border-radius: 2px;
  margin-right: 8px;
`

const SelectedValue = styled.span`
  font-size: 13px;
  padding: 2.5px;
  color: ${COLORS.grayDarkerThree};
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  height: 30px;
  margin: 0 6px 0 7px;
  padding: 2.5px 2.5px 2.5px 7px;
`

export default Tag
