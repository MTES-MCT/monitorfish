import React from 'react'
import {  useField } from 'formik';
import {  InputNumber } from 'rsuite'


export const FormikInputNumber = ({ name, ...props }) => {
  const [field, , helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;
  

  return (
    <InputNumber value={value || ''} onChange={setValue} {...props} />
  );
}

