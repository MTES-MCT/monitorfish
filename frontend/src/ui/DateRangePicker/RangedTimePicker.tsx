import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { stopMouseEventPropagation } from '../../utils/stopMouseEventPropagation'
import { getRangedTimeOptions } from './utils'

import type { TimeTuple } from './types'
import type { Promisable } from 'type-fest'

type RangedTimePickerProps = {
  filter: RegExp
  minutesRange: number
  onChange: (nextTimeTuple: TimeTuple) => Promisable<void>
}
export function RangedTimePicker({ filter, minutesRange, onChange }: RangedTimePickerProps) {
  const rangedTimeOptions = useMemo(() => getRangedTimeOptions(minutesRange), [minutesRange])
  const filteredRangedTimeOptions = useMemo(
    () => rangedTimeOptions.filter(({ label }) => filter.test(label)),
    [filter, rangedTimeOptions]
  )

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0)

  const handleBoxKeyDown = useCallback(
    (event: globalThis.KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()

        const nextSelectedOptionIndex =
          selectedOptionIndex < filteredRangedTimeOptions.length - 1 ? selectedOptionIndex + 1 : 0

        setSelectedOptionIndex(nextSelectedOptionIndex)

        window.document.querySelectorAll('.js-ranged-time-picker-option')[nextSelectedOptionIndex]?.scrollIntoView()
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()

        const nextSelectedOptionIndex =
          selectedOptionIndex > 0 ? selectedOptionIndex - 1 : filteredRangedTimeOptions.length - 1

        setSelectedOptionIndex(nextSelectedOptionIndex)

        window.document.querySelectorAll('.js-ranged-time-picker-option')[nextSelectedOptionIndex]?.scrollIntoView()
      }

      if (['Enter', 'Space', 'Tab'].includes(event.key)) {
        const selectedRangedTimeOption = filteredRangedTimeOptions[selectedOptionIndex]
        if (!selectedRangedTimeOption) {
          return
        }

        onChange(selectedRangedTimeOption.value)
      }
    },
    [filteredRangedTimeOptions, selectedOptionIndex, onChange]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleBoxKeyDown, {
      once: true
    })

    return () => {
      window.removeEventListener('keydown', handleBoxKeyDown)
    }
  }, [handleBoxKeyDown])

  useEffect(() => {
    setSelectedOptionIndex(0)
  }, [filteredRangedTimeOptions])

  if (!filteredRangedTimeOptions.length) {
    return null
  }

  return (
    <Box onClick={stopMouseEventPropagation} role="listbox">
      {filteredRangedTimeOptions.map(({ label, value }, index) => (
        <Option
          key={label}
          aria-selected={false}
          className="js-ranged-time-picker-option"
          isSelected={index === selectedOptionIndex}
          onClick={() => onChange(value)}
          role="option"
          tabIndex={-1}
        >
          {label}
        </Option>
      ))}
    </Box>
  )
}

const Box = styled.div`
  background-color: ${p => p.theme.color.gainsboro};
  display: flex;
  flex-direction: column;
  left: -1px;
  max-height: 10rem;
  overflow: auto;
  position: absolute;
  /* Non-WebKit Firefox Compatibility */
  scrollbar-color: ${p => p.theme.color.lightGray};
  scrollbar-width: thin;
  top: 2.25rem;
  z-index: 9999;

  ::-webkit-scrollbar {
    -webkit-appearance: none;
  }
  ::-webkit-scrollbar:vertical {
    width: 0.33rem;
  }
  ::-webkit-scrollbar-thumb {
    border: 0;
    background-color: ${p => p.theme.color.lightGray};
  }
  ::-webkit-scrollbar-track {
    background-color: ${p => p.theme.color.gainsboro};
  }
`

const Option = styled.div<{
  isSelected: boolean
}>`
  background-color: ${p => (p.isSelected ? p.theme.color.blueGray[100] : 'transparent')};
  cursor: pointer;
  line-height: 1;
  padding: 5px 9px 7px 8px;
  text-align: center;

  :hover {
    background-color: ${p => (p.isSelected ? p.theme.color.blueGray[100] : p.theme.color.blueYonder[25])};
  }
`
