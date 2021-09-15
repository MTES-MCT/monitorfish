import React from 'react'
import styled from 'styled-components'
import { SelectPicker } from 'rsuite'
import { COLORS } from '../../../constants/constants'

const CustomSelectComponent = props => {
  const {
    searchable,
    placeholder,
    value,
    onChange,
    data,
    renderMenuItem,
    menuStyle
  } = props

  const selectPickerStyle = {
    width: 200,
    margin: '0',
    borderColor: COLORS.lightGray,
    boxSizing: 'border-box',
    textOverflow: 'ellipsis'
  }
  return (
    <SelectWrapper>
      <CustomSelectPicker
        style={selectPickerStyle}
        searchable={searchable}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        data={data}
        renderMenuItem={renderMenuItem}
        menuStyle={menuStyle}
        menuClassName={'new-regulation-select-picker'}
      />
    </SelectWrapper>
  )
}

const SelectWrapper = styled.div`
  display: inline-block;
  margin: 0px 10px 0px 0px;
  vertical-align: sub;
`

const CustomSelectPicker = styled(SelectPicker)`
  a {
    box-sizing: border-box;
    border-color: ${COLORS.lightGray}!important;
  }

  .rs-btn-default.rs-picker-toggle:hover {
    border-color: ${COLORS.lightGray}!important;
  }

  .rs-btn-default.rs-picker-toggle:focus {
    border-color: ${COLORS.lightGray}!important;
  }
`

export default CustomSelectComponent
