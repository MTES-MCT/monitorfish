import React from 'react'
import styled from 'styled-components'
import { ReactComponent as CloseIconSVG } from '../../icons/Croix_grise.svg'
import { COLORS } from '../../../constants/constants'
import { Link } from '../../commonStyles/Backoffice.style'

/**
 * @typedef Props
 * @prop {String} tagValue
 * @prop {Function} onCliseIconClicked
 * @prop {URL} tagUrl
 */
const Tag = props => {
  const {
    tagValue,
    tagUrl,
    onCloseIconClicked
  } = props

  return <TagWrapper>
    {!tagUrl
      ? <SelectedValue>{tagValue}</SelectedValue>
      : <Link
          href={tagUrl}
          target={'_blank'}
        >{tagValue}</Link>
    }
    <CloseIcon onClick={_ => onCloseIconClicked(tagValue)}/>
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
  padding: 2.5px;
  color: ${COLORS.gunMetal};
`

const CloseIcon = styled(CloseIconSVG)`
  width: 13px;
  vertical-align: text-bottom;
  cursor: pointer;
  border-left: 1px solid white;
  height: 30px;
  margin: 0 6px 0 7px;
  padding: 2.5px 2.5px 2.5px 7px;
`

export default Tag
