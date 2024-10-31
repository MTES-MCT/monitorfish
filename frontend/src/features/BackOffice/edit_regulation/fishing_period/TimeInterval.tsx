import { THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { convertTimeToString, TIMES_SELECT_PICKER_VALUES } from '../../../Regulation/utils'
import { CustomSelectComponent } from '../custom_form/CustomSelectComponent'

import type { TimeInterval as TypeIntervalType } from '@features/Regulation/types'
import type { CSSProperties } from 'react'

type TimeIntervalProps = Readonly<{
  disabled: boolean | undefined
  id: number
  isLast: boolean | undefined
  onTimeIntervalChange: (id: number, timeInterval: TypeIntervalType) => void
  timeInterval: TypeIntervalType | undefined
}>
export function TimeInterval({
  disabled = false,
  id,
  isLast = false,
  onTimeIntervalChange,
  timeInterval
}: TimeIntervalProps) {
  const setTimeInterval = (key: keyof TypeIntervalType, value: string) => {
    const split = value.split('h')
    const date = new Date()
    date.setHours(Number(split[0]))
    date.setMinutes(Number(split[1]))

    // TODO Refactor this workaround `as` type.
    const newTimeInterval = {
      ...timeInterval,
      [key]: date
    } as TypeIntervalType

    onTimeIntervalChange(id, newTimeInterval)
  }

  return (
    <Wrapper $isLast={isLast}>
      De
      <CustomSelectComponent
        cleanable={false}
        data={TIMES_SELECT_PICKER_VALUES}
        disabled={disabled}
        onChange={value => setTimeInterval('from', value)}
        padding="0px"
        placeholder={'\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0'}
        placement="topStart"
        searchable={false}
        style={selectPickerStyle}
        value={convertTimeToString(timeInterval?.from)}
      />
      à
      <CustomSelectComponent
        cleanable={false}
        data={TIMES_SELECT_PICKER_VALUES}
        disabled={disabled}
        onChange={value => setTimeInterval('to', value)}
        padding="0px"
        placeholder={'\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0'}
        placement="topStart"
        searchable={false}
        style={selectPickerStyle}
        value={convertTimeToString(timeInterval?.to)}
      />
    </Wrapper>
  )
}

const selectPickerStyle: CSSProperties = {
  borderColor: THEME.color.lightGray,
  boxSizing: 'border-box',
  margin: '0px 5px',
  textOverflow: 'ellipsis',
  width: '85px'
}

const Wrapper = styled.div<{
  $isLast: boolean
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${p => (p.$isLast ? '' : 'margin-bottom: 5px;')}
  color: ${p => p.theme.color.slateGray};

  .rs-picker-toggle {
    width: 40px;
  }
`
