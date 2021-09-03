import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../constants/constants'
import { Radio, Checkbox } from 'rsuite'

const MenuItem = ({ checked, item, tag }) => {
  return <>{
    tag === 'Radio'
      ? <CustomRadio checked={checked}>{item.label}</CustomRadio>
      : tag === 'Checkbox'
        ? <CustomCheckbox checked={checked}>{item.label}</CustomCheckbox>
        : null
    }</>
}

const CustomRadio = styled(Radio)`
  .rs-radio-checker > label {
    font-size: 11px;
    color: ${COLORS.slateGray};
  }
`

const CustomCheckbox = styled(Checkbox)`
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
