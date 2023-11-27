import styled from 'styled-components'

import { getIconFromControlUnitResourceType } from './utils'

import type { ControlUnit } from '@mtes-mct/monitor-ui'

type PlaceholderProps = {
  type: ControlUnit.ControlUnitResourceType
}
export function Placeholder({ type }: PlaceholderProps) {
  const SelectedIcon = getIconFromControlUnitResourceType(type)

  return <Wrapper>{SelectedIcon && <SelectedIcon size={32} />}</Wrapper>
}

const Wrapper = styled.div`
  align-items: center;
  background-color: ${p => p.theme.color.lightGray};
  display: flex;
  height: 94px;
  justify-content: center;
  min-height: 94px;
  min-width: 116px;
  width: 116px;
`
