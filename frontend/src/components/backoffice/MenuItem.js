import React from 'react'
import { Radio, Checkbox } from 'rsuite'

const MenuItem = (checked, item, tag) => {
  return <>{tag === 'Radio'
    ? <Radio checked={checked}>{item.label}</Radio>
    : tag === 'Checkbox'
      ? <Checkbox checked={checked}>{item.label}</Checkbox>
      : null
    }</>
}

export default MenuItem
