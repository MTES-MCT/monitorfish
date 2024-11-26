import { Radio, Checkbox } from 'rsuite'
import styled from 'styled-components'

type MenuItemProps = Readonly<{
  checked?: boolean
  item: any
  tag?: string
}>
export function MenuItem({ checked = false, item, tag }: MenuItemProps) {
  const { label } = item
  const labelToDisplay = label

  if (tag === 'Radio') {
    return (
      <CustomRadio checked={checked} title={labelToDisplay}>
        {labelToDisplay}
      </CustomRadio>
    )
  }

  if (tag === 'Checkbox') {
    return (
      <CustomCheckbox checked={checked} title={labelToDisplay}>
        {labelToDisplay}
      </CustomCheckbox>
    )
  }

  return <Text>{labelToDisplay}</Text>
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
    color: ${p => p.theme.color.slateGray};
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
    color: ${p => p.theme.color.slateGray};
  }

  .rs-checkbox-wrapper .rs-checkbox-inner {
    &:before {
      border: 1px solid ${p => p.theme.color.lightGray} !important;
      box-sizing: border-box;
    }

    &:after {
      margin-top: 0px !important;
      margin-left: 4px !important;
    }
  }
`
