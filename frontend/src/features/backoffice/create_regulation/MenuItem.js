import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Radio, Checkbox } from 'rsuite'

const MenuItem = ({ checked, item, tag }) => {
  const { label } = item
  const labelToDisplay = label.replace(/[_]/g, ' ')
  return <>{
    tag === 'Radio'
      ? <CustomRadio
          checked={checked}
          title={labelToDisplay}
        >{labelToDisplay}
        </CustomRadio>
      : tag === 'Checkbox'
        ? <CustomCheckbox
            checked={checked}
            title={labelToDisplay}
          >{labelToDisplay}
          </CustomCheckbox>
        : null
    }</>
}

const CustomRadio = styled(Radio)`
  .rs-radio-checker {
    overflow: hidden;
    text-overflow: ellipsis;
    padding-bottom: 8px;
    padding-left: 36px;
    padding-top: 4px;
    &:before {
      box-sizing: border-box;
    }
    &:after {
      box-sizing: border-box;
    }
  }
  
  .rs-radio-checker > label {
    font-size: 11px;
    color: ${COLORS.slateGray};
  }
`

const CustomCheckbox = styled(Checkbox)`
  .rs-checkbox-checker {
    overflow: hidden;
    text-overflow: text-ellipsis;
    padding-bottom: 4px;
    padding-left: 36px;
    padding-top: 8px;
    &:before {
      box-sizing: border-box;
    }
    &:after {
      box-sizing: border-box;
    }
  }

  .rs-checkbox-checker > label {
    font-size: 11px;
    color: ${COLORS.slateGray};
  }

  .rs-checkbox-wrapper .rs-checkbox-inner {
    &:before {
      border: 1px solid ${props => props.$isrequired ? COLORS.red : COLORS.lightGray} !important;
      box-sizing: border-box;
    }
    &:after {
      margin-top: 0px !important;
      margin-left: 4px !important;
    }
  }
`

export default MenuItem
