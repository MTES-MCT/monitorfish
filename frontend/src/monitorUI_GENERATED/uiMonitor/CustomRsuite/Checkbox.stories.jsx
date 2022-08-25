import React, { useState} from 'react';
import styled from 'styled-components';
import { Checkbox, CheckboxGroup } from 'rsuite';

import { COLORS } from '../../constants/constants';

export default {
  title: 'RsuiteMonitor/Selecteurs'
};

const options = ['A', 'B', 'C', 'D', 'E'];

const TemplateCheckboxGrouped = ({...args}) => {
  const [checkboxState, setCheckboxState] = useState({
    indeterminate: true,
    checkAll: false,
    value: ['A', 'C', 'E']
  })
  console.log(args)
  const handleCheckAll = (value, checked) => {
    const nextValue = checked ? options : [];
    console.log(nextValue, 'handleCheckAll');
    setCheckboxState({
      value: nextValue,
      indeterminate: false,
      checkAll: checked
    });
  }
  const handleChange = (value) => {
    console.log(value, 'handleChange');
    setCheckboxState({
      value,
      indeterminate: value.length > 0 && value.length < options.length,
      checkAll: value.length === options.length
    });
  }
  return (
    <>
      <div>
        <Checkbox
          indeterminate={checkboxState.indeterminate}
          checked={checkboxState.checkAll}
          onChange={handleCheckAll}
        >
          Check all
        </Checkbox>
        <hr />
        <CheckboxGroup
          inline
          name="checkboxList"
          value={checkboxState.value}
          onChange={handleChange}
        >
          <Checkbox value="A">Item A</Checkbox>
          <Checkbox value="B">Item B</Checkbox>
          <Checkbox value="C">Item C</Checkbox>
          <Checkbox value="D" disabled>Item D - disabled</Checkbox>
          <Checkbox value="E" disabled>Item E - disabled</Checkbox>
        </CheckboxGroup>
      </div>
      <GreyContainer>
        <Checkbox
          indeterminate={checkboxState.indeterminate}
          checked={checkboxState.checkAll}
          onChange={handleCheckAll}
        >
          Check all
        </Checkbox>
        <hr />
        <CheckboxGroup
          inline
          name="checkboxList"
          value={checkboxState.value}
          onChange={handleChange}
        >
          <Checkbox value="A">Item A</Checkbox>
          <Checkbox value="B">Item B</Checkbox>
          <Checkbox value="C">Item C</Checkbox>
          <Checkbox value="D" disabled>Item D - disabled</Checkbox>
          <Checkbox value="E" disabled>Item E - disabled</Checkbox>
        </CheckboxGroup>
      </GreyContainer>
    </>
  )
}

export const CheckboxGrouped = TemplateCheckboxGrouped.bind({})

const GreyContainer = styled.div`
  background: ${COLORS.lightGray}
`