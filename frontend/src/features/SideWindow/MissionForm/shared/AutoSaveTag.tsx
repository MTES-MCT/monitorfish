import { Tag } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type AutoSaveTagProps = {
  isAutoSaveEnabled: boolean
}
export function AutoSaveTag({ isAutoSaveEnabled }: AutoSaveTagProps) {
  return (
    <Wrapper isAutoSaveEnabled={isAutoSaveEnabled}>
      {isAutoSaveEnabled ? 'Enregistrement auto. actif' : 'Enregistrement auto. inactif'}
    </Wrapper>
  )
}

const Wrapper = styled(Tag)<{
  isAutoSaveEnabled: boolean
}>`
  background: ${p => (p.isAutoSaveEnabled ? p.theme.color.mediumSeaGreen25 : p.theme.color.gainsboro)};
  color: ${p => (p.isAutoSaveEnabled ? p.theme.color.mediumSeaGreen : p.theme.color.slateGray)};
  margin-left: 24px;
  vertical-align: middle;
  align-self: unset;
  font-weight: 500;
`
