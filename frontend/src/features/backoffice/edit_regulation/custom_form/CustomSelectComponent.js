import React from 'react'
import { SelectPicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../../../constants/constants'

function CustomSelectComponent(props) {
  const {
    cleanable,
    data,
    dataCy,
    disabled,
    emptyMessage,
    groupBy,
    menuClassName,
    menuStyle,
    onChange,
    padding,
    placeholder,
    placement,
    renderMenuItem,
    searchable,
    style,
    value,
    valueIsMissing,
    width
  } = props

  const DEFAULT_SELECT_PICKER_STYLE = {
    borderColor: COLORS.lightGray,
    boxSizing: 'border-box',
    margin: '0',
    textOverflow: 'ellipsis',
    width: width || 200
  }

  return (
    <SelectWrapper padding={padding}>
      <CustomSelectPicker
        $valueIsMissing={valueIsMissing}
        cleanable={cleanable}
        data={data}
        data-cy={dataCy}
        disabled={disabled}
        groupBy={groupBy}
        locale={{
          emptyMessage,
          noResultsText: emptyMessage
        }}
        menuClassName={menuClassName}
        menuStyle={menuStyle}
        onChange={onChange}
        placeholder={placeholder}
        placement={placement || 'auto'}
        renderMenuItem={renderMenuItem}
        searchable={searchable}
        style={style || DEFAULT_SELECT_PICKER_STYLE}
        value={value}
        virtualized
      />
    </SelectWrapper>
  )
}

const SelectWrapper = styled.div`
  display: inline-block;
  margin: ${props => (props.padding ? props.padding : '0px 10px 0px 0px')};
  vertical-align: sub;
`

const CustomSelectPicker = styled(SelectPicker)`
  a {
    box-sizing: border-box;
    border-color: ${props => (props.$valueIsMissing ? COLORS.maximumRed : COLORS.lightGray)}!important;
  }

  .rs-btn-default.rs-picker-toggle:hover {
    border-color: ${props => (props.$valueIsMissing ? COLORS.maximumRed : COLORS.lightGray)}!important;
  }

  .rs-btn-default.rs-picker-toggle:focus {
    border-color: ${props => (props.$valueIsMissing ? COLORS.maximumRed : COLORS.lightGray)}!important;
  }

  .grouped.rs-picker-select-menu-item {
    padding-left: 0px;
  }

  .rs-picker-toggle {
    width: ${p => (p.width ? p.width - 40 : 160)}px;
  }
`

export default CustomSelectComponent
