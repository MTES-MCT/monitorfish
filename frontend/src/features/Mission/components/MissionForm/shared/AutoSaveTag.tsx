import { Tag, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

type AutoSaveTagProps = Readonly<{
  className?: string | undefined
  isAutoSaveEnabled?: boolean
}>
export function AutoSaveTag({ className, isAutoSaveEnabled = false }: AutoSaveTagProps) {
  return (
    <Wrapper
      backgroundColor={isAutoSaveEnabled ? THEME.color.mediumSeaGreen25 : THEME.color.gainsboro}
      className={className}
      color={isAutoSaveEnabled ? THEME.color.mediumSeaGreen : THEME.color.slateGray}
    >
      {isAutoSaveEnabled ? 'Enregistrement auto. actif' : 'Enregistrement auto. inactif'}
    </Wrapper>
  )
}

const Wrapper = styled(Tag)`
  margin: auto 0 auto 0;
  vertical-align: middle;
  font-weight: 500;
`
