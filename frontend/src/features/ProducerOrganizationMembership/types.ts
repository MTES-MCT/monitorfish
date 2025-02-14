import { ProducerOrganizationMembershipSchema } from '@features/ProducerOrganizationMembership/schemas/ProducerOrganizationMembershipSchema'
import { z } from 'zod'

export type ProducerOrganizationMembership = z.infer<typeof ProducerOrganizationMembershipSchema>
