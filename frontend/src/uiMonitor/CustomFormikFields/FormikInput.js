import React from 'react'
import {  useField } from 'formik';
import { Input } from 'rsuite'
import styled from 'styled-components';
import { COLORS } from '../../constants/constants';


export const FormikInput = ({ name, ...props }) => {
  const [field, , helpers] = useField(name);
  const { value } = field;
  const { setValue } = helpers;
  

  return (
    <Input value={value || ''} onChange={setValue} {...props} />
  );
}


export const FormikInputGhost = styled(FormikInput)`
  background-color: ${COLORS.white};
`