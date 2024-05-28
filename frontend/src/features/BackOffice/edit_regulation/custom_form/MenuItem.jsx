import React from 'react'
import styled from 'styled-components'
import { COLORS } from '../../../../constants/constants'
import { Radio, Checkbox } from 'rsuite'

const MenuItem = ({ checked, item, tag }) => {
  const { label } = item
  const labelToDisplay = label
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
        : <Text>{labelToDisplay}</Text>
    }</>
}

const Text = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 8px 0px 4px 10px;
`

const CustomRadio = styled(Radio)`
  .rs-radio-checker {
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 4px 0px 8px 36px;
    &:before {
      box-sizing: border-box;
    }
    &:after {
      box-sizing: border-box;
    }
  }
  
  .rs-radio-checker > label {
    font-size: 13px;
    color: ${COLORS.slateGray};
  }
`

const CustomCheckbox = styled(Checkbox)`
  .rs-checkbox-checker {
    overflow: hidden;
    text-overflow: text-ellipsis;
    padding: 8px 0px 4px 36px;
    &:before {
      box-sizing: border-box;
    }
    &:after {
      box-sizing: border-box;
    }
  }

  .rs-checkbox-checker > label {
    font-size: 13px;
    color: ${COLORS.slateGray};
  }

  .rs-checkbox-wrapper .rs-checkbox-inner {
    &:before {
      border: 1px solid ${COLORS.lightGray} !important;
      box-sizing: border-box;
    }
    
    &:after {
      margin-top: 0px !important;
      margin-left: 4px !important;
    }
  }
`

export default MenuItem
