import React from 'react'
import {  useField } from 'formik';
import { Input } from 'rsuite'


export const FormikTextarea = ({ name, ...props }) => {
  const [field, , helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;
  

  return (
    <Input as="textarea" rows={3} value={value} onChange={setValue} {...props} />
  );
}

