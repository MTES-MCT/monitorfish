/* eslint-disable react/jsx-props-no-spreading */
import { useField } from 'formik'
import { Checkbox } from 'rsuite'

export function FormikCheckbox({ label, name, ...props }) {
  const [field, , helpers] = useField(name)
  const { value } = field
  const { setValue } = helpers
  const handleSetValue = (_, checked) => {
    setValue(checked)
  }

  return (
    <Checkbox checked={value} name={name} onChange={handleSetValue} {...props}>
      {label}
    </Checkbox>
  )
}
