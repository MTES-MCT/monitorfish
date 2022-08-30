import React from 'react'
import {  useField } from 'formik';
import { Checkbox, CheckboxGroup } from 'rsuite'


export const FormikCheckboxGroup = ({ label, name, checkBoxValues, defaultValue, ...props }) => {
  const [field, , helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;
  
  return (
    <CheckboxGroup
      name={name} 
      value={value}
      onChange={setValue}
      {...props}
      defaultValue={defaultValue}
    >
      {
        Object.entries(checkBoxValues)?.map(([key, val])=> {
          return <Checkbox key={key} value={val.code}>{val.libelle}</Checkbox>
        })
      }
    </CheckboxGroup>
  );
}
