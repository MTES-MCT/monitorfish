import { removeTagFromVesselFilter } from '@features/VesselFilter/useCases/removeTagFromVesselFilter'
import { useMainAppDispatch } from '@hooks/useMainAppDispatch'
import { Icon, THEME } from '@mtes-mct/monitor-ui'
import styled from 'styled-components'

import type { FilterTag as FilterTagType } from '@features/VesselFilter/types'

type FilterTagProps = Readonly<{
  iconElement: JSX.Element | undefined
  remove?: () => void
  tag: FilterTagType
  text: string
  uuid: string | undefined
}>
export function FilterTag({ iconElement, remove, tag, text, uuid }: FilterTagProps) {
  const dispatch = useMainAppDispatch()

  return (
    <TagWrapper>
      {iconElement && <TagIcon>{iconElement}</TagIcon>}
      <TagName data-cy="vessel-filter-tag">{text}</TagName>
      <CloseIcon
        color={THEME.color.gunMetal}
        data-cy="vessel-filter-remove-tag"
        onClick={() => (remove ? remove() : dispatch(removeTagFromVesselFilter({ ...tag, uuid })))}
        size={10}
      />
    </TagWrapper>
  )
}

const TagIcon = styled.span`
  vertical-align: top;
`

const TagName = styled.span`
  vertical-align: top;
  color: ${THEME.color.gunMetal};
  font-weight: 500;
  margin-right: 5px;
`

const TagWrapper = styled.span`
  background: ${THEME.color.gainsboro};
  border-radius: 2px;
  margin-right: 10px;
  margin-bottom: 8px;
  font-size: 13px;
  padding: 0px 3px 0px 7px;
  height: 26px;
  float: left;

  .Element-IconBox {
    padding: 3px 2px 3px 2px;
    border-left: 1px solid white;
  }
`

const CloseIcon = styled(Icon.Close)`
  cursor: pointer;
  margin: 5px;
`
