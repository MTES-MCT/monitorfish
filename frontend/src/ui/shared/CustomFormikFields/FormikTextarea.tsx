/* eslint-disable react/jsx-props-no-spreading */
import { useField } from 'formik'
import { Input } from 'rsuite'

export function FormikTextarea({ name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers
  const handleOnChange = e => {
    setValue(e)
  }

  return <Input as="textarea" onChange={handleOnChange} rows={3} value={value || ''} {...props} />
}
