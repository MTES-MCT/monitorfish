import { z } from 'zod'

export const NatinfCodeSchema = z.strictObject({
  label: z.string(),
  value: z.union([z.string(), z.number()])
})

export const ThreatCharacterizationSchema = z.strictObject({
  children: z.array(NatinfCodeSchema),
  label: z.string(),
  value: z.string()
})

export const ThreatSchema = z.strictObject({
  children: z.array(ThreatCharacterizationSchema),
  label: z.string(),
  value: z.string()
})
