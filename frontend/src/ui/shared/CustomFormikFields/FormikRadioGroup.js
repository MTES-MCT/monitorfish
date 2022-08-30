import React from 'react'
import {  useField } from 'formik';
import { RadioGroup, Radio } from 'rsuite'


export const FormikRadioGroup = ({ name, radioValues, defaultValue, ...props }) => {
  const [field, , helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;
  

  return (
    <RadioGroup 
      name={name} 
      inline
      value={value}
      onChange={setValue}
      {...props}
      defaultValue={defaultValue}
    >
      {
        Object.entries(radioValues).map(([key, val])=> {
          return <Radio key={key} value={val.code}>{val.libelle}</Radio>
        })
      }
      
    </RadioGroup>
  );
}
