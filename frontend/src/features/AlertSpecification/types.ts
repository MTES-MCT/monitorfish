import {
  AdministrativeAreaSpecificationSchema,
  GearSpecificationSchema,
  AlertSpecificationSchema,
  RegulatoryAreaSpecificationSchema,
  SpeciesSpecificationSchema
} from '@features/AlertSpecification/schemas/AlertSpecificationSchema'
import { z } from 'zod'

export type AlertSpecification = z.infer<typeof AlertSpecificationSchema>
export type GearSpecification = z.infer<typeof GearSpecificationSchema>
export type SpeciesSpecification = z.infer<typeof SpeciesSpecificationSchema>
export type RegulatoryAreaSpecification = z.infer<typeof RegulatoryAreaSpecificationSchema>
export type AdministrativeAreaSpecification = z.infer<typeof AdministrativeAreaSpecificationSchema>

export enum AdministrativeAreaType {
  DISTANCE_TO_SHORE = 'DISTANCE_TO_SHORE',
  EEZ_AREA = 'EEZ_AREA',
  FAO_AREA = 'FAO_AREA',
  NEAFC_AREA = 'NEAFC_AREA'
}
