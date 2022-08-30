import React from 'react'
import {  useField } from 'formik';
import { Checkbox } from 'rsuite'


export const FormikCheckbox = ({ label, name, defaultValue, ...props }) => {
  const [field, , helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;
  
  return (
    <Checkbox 
      name={name} 
      value={value}
      onChange={setValue}
      {...props}
      defaultValue={defaultValue}
    >
      {label}
    </Checkbox>
  );
}
