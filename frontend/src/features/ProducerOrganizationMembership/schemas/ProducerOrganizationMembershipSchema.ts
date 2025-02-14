import { z } from 'zod'

export const ProducerOrganizationMembershipSchema = z.object({
  /** CFR * */
  internalReferenceNumber: z.string(),
  joiningDate: z.string(),
  organizationName: z.string()
})
