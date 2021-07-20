import React from 'react'
import styled from 'styled-components'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'

const Tag = props => {
  const {
    selectedValue,
    onCloseIconClicked
  } = props

  return <TagWrapper>
    <SelectedValue>{selectedValue}</SelectedValue>
    <CloseIcon onClick={_ => onCloseIconClicked(selectedValue)}/>
  </TagWrapper>
}

const TagWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #EDEDED;
  border-radius: 2px;
  margin-right: 8px;
`

const SelectedValue = styled.span`
  font-size: 13px;
  padding: 2.5px;
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
