import styled from 'styled-components'

import { Link } from '../../../commonStyles/Backoffice.style'
import CloseIconSVG from '../../../icons/Croix_grise.svg?react'

type TagProps = Readonly<{
  backGroundColor?: string
  onClickText?: () => void
  onCloseIconClicked: (tagValue: string) => void
  tagUrl?: string
  tagValue: string
}>
export function Tag({ backGroundColor, onClickText, onCloseIconClicked, tagUrl, tagValue }: TagProps) {
  return (
    <TagWrapper $backGroundColor={backGroundColor} data-cy={`tag-${tagValue}`}>
      {tagUrl && (
        <Link $tagUrl href={tagUrl} target="_blank">
          {tagValue}
        </Link>
      )}
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      {!tagUrl && onClickText && <Link onClick={onClickText}>{tagValue}</Link>}
      {!tagUrl && !onClickText && <SelectedValue title={tagValue}>{tagValue}</SelectedValue>}
      <CloseIcon data-cy={`close-tag-${tagValue}`} onClick={_ => onCloseIconClicked(tagValue)} />
    </TagWrapper>
  )
}

const TagWrapper = styled.div<{ $backGroundColor?: string | undefined }>`
  align-self: start;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${p => p.$backGroundColor ?? p.theme.color.gainsboro};
  border-radius: 2px;
  margin-right: 8px;
`

const SelectedValue = styled.span`
  font-size: 13px;
  padding: 3px 8px;
  color: ${p => p.theme.color.gunMetal};
  font-weight: 500;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  padding: 6px 6px 6px 5px;
`
