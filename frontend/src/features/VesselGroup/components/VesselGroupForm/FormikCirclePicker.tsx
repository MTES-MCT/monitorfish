import { Legend } from '@mtes-mct/monitor-ui'
import { useField } from 'formik'
import { CirclePicker } from 'react-color/es'
import styled from 'styled-components'

export function FormikCirclePicker() {
  const [field, meta, helpers] = useField<string | undefined>('color')

  return (
    <>
      <StyledLegend $hasError={!!meta.error} $isRequired>
        Couleur du groupe
      </StyledLegend>
      <CirclePicker
        circleSize={20}
        circleSpacing={10}
        color={field.value}
        colors={[
          '#2c6e49',
          '#8a1c7c',
          '#8c2c17',
          '#38b277',
          '#303eff',
          '#8389f7',
          '#af6f1b',
          '#e0876c',
          '#eabd00',
          '#fc4c0d'
        ]}
        onChangeComplete={color => helpers.setValue(color.hex)}
        width="300px"
      />
    </>
  )
}

const StyledLegend = styled(Legend)`
  text-align: left;
  margin-bottom: 8px;
`
