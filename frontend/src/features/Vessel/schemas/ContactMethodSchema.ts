import { z } from 'zod'

export const ContactMethodSchema = z.strictObject({
  contactMethod: z.string().optional(),
  contactMethodShouldBeChecked: z.boolean().optional(),
  id: z.number().optional(),
  vesselId: z.number()
})
