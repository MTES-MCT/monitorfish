import React from 'react'
import styled from 'styled-components'
import { SelectPicker } from 'rsuite'
import { COLORS } from '../../../../constants/constants'

const CustomSelectComponent = props => {
  const {
    searchable,
    placeholder,
    value,
    onChange,
    data,
    renderMenuItem,
    menuStyle,
    valueIsMissing,
    groupBy,
    disabled,
    emptyMessage,
    placement,
    cleanable,
    style,
    menuClassName,
    padding,
    width,
    dataCy
  } = props

  const DEFAULT_SELECT_PICKER_STYLE = {
    width: width || 200,
    margin: '0',
    borderColor: COLORS.lightGray,
    boxSizing: 'border-box',
    textOverflow: 'ellipsis'
  }
  return (
    <SelectWrapper padding={padding}>
      <CustomSelectPicker
        virtualized
        style={style || DEFAULT_SELECT_PICKER_STYLE}
        searchable={searchable}
        cleanable={cleanable}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        data={data}
        renderMenuItem={renderMenuItem}
        menuStyle={menuStyle}
        menuClassName={menuClassName}
        $valueIsMissing={valueIsMissing}
        locale={{
          noResultsText: emptyMessage,
          emptyMessage: emptyMessage
        }}
        groupBy={groupBy}
        disabled={disabled}
        placement={placement || 'auto'}
        data-cy={dataCy}
      />
    </SelectWrapper>
  )
}

const SelectWrapper = styled.div`
  display: inline-block;
  margin: ${props => props.padding ? props.padding : '0px 10px 0px 0px'};
  vertical-align: sub;
`

const CustomSelectPicker = styled(SelectPicker)`
  a {
    box-sizing: border-box;
    border-color: ${props => props.$valueIsMissing ? COLORS.maximumRed : COLORS.lightGray}!important;
  }

  .rs-btn-default.rs-picker-toggle:hover {
    border-color: ${props => props.$valueIsMissing ? COLORS.maximumRed : COLORS.lightGray}!important;
  }

  .rs-btn-default.rs-picker-toggle:focus {
    border-color: ${props => props.$valueIsMissing ? COLORS.maximumRed : COLORS.lightGray}!important;
  }

  .grouped.rs-picker-select-menu-item {
    padding-left: 0px;
  }

  .rs-picker-toggle {
    width: ${p => p.width ? p.width - 40 : 160}px;
  }
`

export default CustomSelectComponent
