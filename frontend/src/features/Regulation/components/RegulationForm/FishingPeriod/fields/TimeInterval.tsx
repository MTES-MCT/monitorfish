import { Select } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import { TIMES_SELECT_PICKER_VALUES } from '../../../../utils'

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
    const newTimeInterval = {
      ...timeInterval,
      [key]: value
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
        value={timeInterval?.from}
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
        value={timeInterval?.to}
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
  color: #FF3392;
`
