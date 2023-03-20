import { Fieldset, FieldsetProps, THEME } from '@mtes-mct/monitor-ui'
import { LoopingRhombusesSpinner } from 'react-epic-spinners'
import styled, { css } from 'styled-components'

export type FieldsetGroupProps = FieldsetProps & {
  isInline?: boolean
}
export const FieldsetGroup = styled(Fieldset)<FieldsetGroupProps>`
  /* TODO Add these props in monitor-ui. */
  min-width: 0;

  > div {
    display: flex;
    flex-direction: ${p => (p.isInline ? 'row' : 'column')};

    ${p =>
      p.isInline &&
      css`
        > div:first-child {
          flex-grow: 1;
          margin-right: 16px;
        }
      `}

    > button:not(:first-child),
    > .Field:not(:first-child),
    > fieldset:not(:first-child),
    > hr {
      margin-top: 16px;
    }
  }
`

export function FieldsetGroupSpinner(props: FieldsetGroupProps) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Wrapper {...props}>
      <LoopingRhombusesSpinner color={THEME.color.lightGray} size={13} />
    </Wrapper>
  )
}

const Wrapper = styled(FieldsetGroup)`
  > div {
    flex-direction: row;
    justify-content: center;
  }
`
