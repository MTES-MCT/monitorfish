import { THEME, Tag } from '@mtes-mct/monitor-ui'
import { useFormikContext } from 'formik'
import styled from 'styled-components'

import { isZeroNotice } from './utils'

import type { FormValues } from './types'

export function TagBar() {
  const { values } = useFormikContext<FormValues>()

  return <Wrapper>{isZeroNotice(values) && <Tag borderColor={THEME.color.slateGray}>Préavis Zéro</Tag>}</Wrapper>
}

const Wrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`
