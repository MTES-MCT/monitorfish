import { number, object } from 'yup'

export const SeaControlFormSchema = object().shape({
  vesselId: number().integer().required('Veuillez indiquer le navire contrôlé')
})
