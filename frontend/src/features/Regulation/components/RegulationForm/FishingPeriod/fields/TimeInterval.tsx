import { Select } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { convertTimeToString, TIMES_SELECT_PICKER_VALUES } from '../../../../utils'

import type { TimeInterval as TypeIntervalType } from '@features/Regulation/types'

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
      [key]: date.toISOString()
    } as TypeIntervalType

    onTimeIntervalChange(id, newTimeInterval)
  }

  return (
    <Wrapper $isLast={isLast}>
      De
      <StyledSelect
        cleanable={false}
        disabled={disabled}
        isLabelHidden
        label="De"
        name="from"
        onChange={value => setTimeInterval('from', value as string)}
        options={TIMES_SELECT_PICKER_VALUES}
        placeholder={'\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0'}
        searchable
        value={convertTimeToString(timeInterval?.from)}
      />
      à
      <StyledSelect
        cleanable={false}
        disabled={disabled}
        isLabelHidden
        label="à"
        name="to"
        onChange={value => setTimeInterval('to', value as string)}
        options={TIMES_SELECT_PICKER_VALUES}
        placeholder={'\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0\xa0\xa0'}
        searchable
        value={convertTimeToString(timeInterval?.to)}
      />
    </Wrapper>
  )
}

const StyledSelect = styled(Select)`
  margin-left: 7px;
  margin-right: 7px;
`

const Wrapper = styled.div<{
  $isLast: boolean
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  ${p => (p.$isLast ? '' : 'margin-bottom: 5px;')}
  color: ${p => p.theme.color.slateGray};
`
