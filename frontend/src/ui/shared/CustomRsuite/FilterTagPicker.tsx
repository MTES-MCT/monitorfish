import { MutableRefObject, useRef, useState } from 'react'
import { TagPicker } from 'rsuite'
import styled from 'styled-components'

import { COLORS } from '../../constants/constants'

export function FilterTagPicker({ onChange, value, ...props }) {
  const [displayPlaceholder, setDisplayPlaceholder] = useState(true)
  const filterWrapperRef = useRef() as MutableRefObject<HTMLDivElement>
  const { placeholder, style, ...rest } = props
  const selectedItems = value?.length
  const hidePlaceholder = () => {
    setDisplayPlaceholder(false)
  }
  const showPlaceholder = () => {
    setDisplayPlaceholder(true)
  }

  return (
    <FilterWrapper style={style}>
      <PlaceholderWrapper displayPlaceholder={displayPlaceholder}>
        <PlaceholderContent>
          {placeholder} {selectedItems > 0 && <strong> ({selectedItems})</strong>}
        </PlaceholderContent>
      </PlaceholderWrapper>
      <StyledTagPicker
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...rest}
        $selectedItems={selectedItems}
        cleanable={false}
        container={() => filterWrapperRef.current}
        onChange={onChange}
        onEnter={hidePlaceholder}
        onExit={showPlaceholder}
        placeholder=" "
        searchable
        value={value}
      />
      <MenuWrapper ref={filterWrapperRef} />
    </FilterWrapper>
  )
}

const StyledTagPicker = styled(TagPicker)<{ $selectedItems: number }>`
  background-color: transparent;
  margin-bottom: ${props => (props.$selectedItems > 0 ? '36px' : '0')};
  width: 100%;
  min-height: 36px;
  border: 0;
  .rs-picker-toggle.rs-btn.rs-btn-default {
    padding-top: 5px;
    padding-bottom: 5px;
    height: 30px;
  }
  input.rs-picker-toggle-textbox.rs-picker-toggle-read-only {
    border: 1px solid ${COLORS.lightGray} !important;
    background: transparent;
    opacity: 1;
  }
  svg.rs-picker-toggle-caret.rs-icon {
    top: 5px !important;
  }
  .rs-picker-toggle {
    background-color: transparent !important;
  }
  .rs-tag {
    background-color: ${COLORS.blueYonder};
    color: ${COLORS.white};
    margin-left: 0 !important;
    margin-right: 5px;
  }
  .rs-picker-tag-wrapper {
    // display: ${props => (props.selectedItems > 0 ? 'block' : 'none')};
    top: 36px;
    width: 100%;
    > .rs-picker-search {
      display: block;
      position: absolute;
      top: -38px;
    }
  }
`
const MenuWrapper = styled.div`
  .rs-picker-menu {
    position: absolute;
    top: 32px !important;
  }
`
const FilterWrapper = styled.div`
  position: relative;
  min-width: 100px;
`

const PlaceholderWrapper = styled.div<{ displayPlaceholder: boolean }>`
  display: ${p => (p.displayPlaceholder ? 'block' : 'none')};
  position: absolute;
  top: 4px;
  left: 50%;
  font-size: 13px;
`
const PlaceholderContent = styled.div`
  position: relative;
  left: -50%;
  white-space: nowrap;
`
