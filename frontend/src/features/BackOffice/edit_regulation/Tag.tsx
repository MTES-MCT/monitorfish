import styled from 'styled-components'

import { Link } from '../../commonStyles/Backoffice.style'
import CloseIconSVG from '../../icons/Croix_grise.svg?react'

type TagProps = Readonly<{
  onClickText?: () => void
  onCloseIconClicked: (tagValue: string) => void
  tagUrl?: string
  tagValue: string
}>
export function Tag({ onClickText, onCloseIconClicked, tagUrl, tagValue }: TagProps) {
  return (
    <TagWrapper data-cy={`tag-${tagValue}`}>
      {tagUrl && (
        <Link href={tagUrl} tagUrl target="_blank">
          {tagValue}
        </Link>
      )}
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      {!tagUrl && onClickText && <Link onClick={onClickText}>{tagValue}</Link>}
      {!tagUrl && !onClickText && <SelectedValue>{tagValue}</SelectedValue>}
      <CloseIcon data-cy={`close-tag-${tagValue}`} onClick={_ => onCloseIconClicked(tagValue)} />
    </TagWrapper>
  )
}

const TagWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${p => p.theme.color.gainsboro};
  border-radius: 2px;
  margin-right: 8px;
`

const SelectedValue = styled.span`
  font-size: 13px;
  padding: 3px 8px;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  padding: 6px 6px 6px 5px;
`
