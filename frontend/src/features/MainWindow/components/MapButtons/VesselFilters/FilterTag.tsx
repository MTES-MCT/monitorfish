import { COLORS } from '@constants/constants'
import styled from 'styled-components'

import CloseIconSVG from '../../icons/Croix_grise.svg?react'

type FilterTagProps = Readonly<{
  iconElement: JSX.Element | undefined
  removeTagFromFilter:
    | ((removeObject: { type: string | undefined; uuid: string | undefined; value: number | string }) => void)
    | undefined
  text: string
  type: string | undefined
  uuid: string | undefined
  value: number | string
}>
export function FilterTag({ iconElement, removeTagFromFilter, text, type, uuid, value }: FilterTagProps) {
  const callRemoveTagFromFilter = () => {
    if (!removeTagFromFilter) {
      return
    }

    const removeObject = { type, uuid, value }

    removeTagFromFilter(removeObject)
  }

  return (
    <TagWrapper>
      {iconElement ? <TagIcon>{iconElement}</TagIcon> : null}
      <TagName data-cy="vessel-filter-tag">{text}</TagName>
      <CloseIcon data-cy="vessel-filter-remove-tag" onClick={callRemoveTagFromFilter} />
    </TagWrapper>
  )
}

const TagIcon = styled.span`
  padding-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
`

const TagName = styled.span`
  padding-bottom: 5px;
  vertical-align: middle;
  height: 30px;
  display: inline-block;
  color: ${COLORS.gunMetal};
  font-weight: 500;
`

const TagWrapper = styled.span`
  background: ${COLORS.gainsboro};
  border-radius: 2px;
  color: ${COLORS.slateGray};
  margin-left: 0;
  margin-right: 10px;
  margin-bottom: 8px;
  font-size: 13px;
  padding: 0px 3px 0px 7px;
  vertical-align: top;
  height: 30px;
  float: left;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  height: 30px;
  margin: 0 6px 0 7px;
  padding-left: 7px;
`
