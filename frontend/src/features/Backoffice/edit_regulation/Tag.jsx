import React from 'react'
import styled from 'styled-components'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { COLORS } from '../../../constants/constants'
import { Link } from '../../commonStyles/Backoffice.style'

/**
 * @typedef Props
 * @prop {String} tagValue
 * @prop {Function} onCloseIconClicked
 * @prop {URL} tagUrl
 */
const Tag = props => {
  const {
    tagValue,
    tagUrl,
    onCloseIconClicked,
    onClickText
  } = props

  return <TagWrapper data-cy={`tag-${tagValue}`}>
    {tagUrl
      ? <Link
          tagUrl
          href={tagUrl}
          target={'_blank'}
        >{tagValue}</Link>
      : onClickText
        ? <Link onClick={onClickText}
          >{tagValue}</Link>
        : <SelectedValue >{tagValue}</SelectedValue>
    }
    <CloseIcon data-cy={`close-tag-${tagValue}`} onClick={_ => onCloseIconClicked(tagValue)}/>
  </TagWrapper>
}

const TagWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${COLORS.gainsboro};
  border-radius: 2px;
  margin-right: 8px;
`

const SelectedValue = styled.span`
  font-size: 13px;
  padding: 3px 8px;
  color: ${COLORS.gunMetal};
  font-weight: 500;
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  padding: 6px 6px 6px 5px;
`

export default Tag
