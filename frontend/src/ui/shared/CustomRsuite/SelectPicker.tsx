import { MutableRefObject, useRef } from 'react'
import { SelectPicker as RSuiteSelectPicker, SelectPickerProps } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

type CustomSelectPickerProps<T> = SelectPickerProps<T> & {}

export function SelectPicker<T>({
  block,
  className,
  data,
  disabled,
  labelKey,
  menuStyle,
  onChange,
  searchable,
  size,
  style,
  value,
  valueKey
}: CustomSelectPickerProps<T>) {
  const wrapperRef = useRef() as MutableRefObject<HTMLDivElement>

  const DEFAULT_SELECT_PICKER_STYLE = {
    width: block ? undefined : 200
  }

  const DEFAULT_SELECT_PICKER_MENU_STYLE = {
    width: block ? undefined : 200
  }

  return (
    <Wrapper ref={wrapperRef} className={className}>
      <RSuiteSelectPicker
        block={block}
        container={() => wrapperRef.current}
        data={data}
        disabled={disabled}
        labelKey={labelKey || 'label'}
        menuStyle={
          menuStyle === undefined
            ? DEFAULT_SELECT_PICKER_MENU_STYLE
            : { ...DEFAULT_SELECT_PICKER_MENU_STYLE, ...menuStyle }
        }
        onChange={onChange}
        searchable={searchable === undefined ? true : searchable}
        size={size || 'sm'}
        style={style || DEFAULT_SELECT_PICKER_STYLE}
        value={value}
        valueKey={valueKey || 'value'}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  .rs-picker-select-menu.rs-picker-menu {
    position: relative;
    margin-top: -30px;
    padding-top: 0;
  }
  .rs-picker-select-menu.rs-picker-select-menu-items {
    position: relative;
    padding-top: 0;
  }
  .rs-picker-menu .rs-picker-search-bar {
    position: static;
    padding: 0;
  }
  .rs-picker-menu .rs-picker-search-bar .rs-picker-search-bar-input {
    padding: 3px;
    margin: 8px;
    min-width: 100px;
    width: calc(100% - 16px);
    border-radius: 0;
    background: ${COLORS.white};
    border: 1px solid ${COLORS.lightGray};
  }
  .rs-picker-menu .rs-picker-search-bar .rs-picker-search-bar-search-icon {
    color: ${COLORS.lightGray};
    width: 11px;
    top: 13px;
  }
`
export const SelectPickerWhite = styled(SelectPicker)`
  .rs-picker-toggle.rs-btn.rs-btn-default,
  .rs-picker-toggle-textbox {
    background-color: white !important;
  }
`
