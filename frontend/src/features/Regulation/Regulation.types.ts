import type { RegulatoryZone } from './types'
import type { Feature, FeatureCollection, Polygon } from 'geojson'

export namespace Regulation {
  /**
   * @example
   * ```ts
   * {
   *  'Reg locale / NAMO': {
   *   Armor_CSJ_Dragues: [
   *     {
   *      bycatch: undefined,
   *      closingDate: undefined,
   *      deposit: undefined,
   *      hooks: Object { authorized: undefined, annualRecurrence: undefined, dateRanges: [], … },
   *      gears: 'DHB, DRH, DHS',
   *      geometry: null,
   *      id: 3012,
   *      lawType: 'Reg. MED',
   *      mandatoryDocuments: undefined,
   *      obligations: undefined,
   *      openingDate: undefined,
   *      period: undefined,
   *      permissions: undefined,
   *      prohibitedGears: null,
   *      prohibitedSpecies: null,
   *      prohibitions: undefined,
   *      quantity: undefined,
   *      region: 'Occitanie, Languedoc-Roussillon',
   *      gearRegulation: Object { authorized: undefined, allGears: undefined, allTowedGears: undefined, … },
   *      regulatoryReferences: Array [ {…} ],
   *      regulatorySpecies: Object { authorized: undefined, allSpecies: undefined, otherInfo: undefined, … },
   *      rejections: undefined,
   *      size: undefined,
   *      species: 'coquillages et appâts\n',
   *      state: undefined,
   *      technicalMeasurements: undefined,
   *      topic: 'Etang de Thau-Ingril Mèze',
   *      upcomingRegulatoryReferences: undefined,
   *      zone: 'Etang de Thau-Ingrill_Drague-à-main',
   *      next_id: undefined,
   *      tags: ["ARP"]
   *     }
   *   ]
   *   'Glénan_CSJ_Dragues': (1) […],
   *   'Bretagne_Laminaria_Hyperborea_Scoubidous - 2019': (1) […],
   *  },
   *  'Reg locale / Sud-Atlantique, SA': {
   *   'Embouchure_Gironde': (1) […],
   *   'Pertuis_CSJ_Dragues': (6) […],
   *   'SA_Chaluts_Pelagiques': (5) […]
   *  }
   * }
   * ```
   */
  // TODO Find a better name.
  export type StructuredRegulatoryObject = {
    layersTopicsByRegulatoryTerritory: Record<string, Record<string, Record<string, RegulatoryZone[]>>>
    layersWithoutGeometry: RegulatoryZone[]
  }

  // TODO Find a better name.
  export type RegulatoryFeatureObject = {
    fishing_period?: string | undefined
    gears?: string | undefined
    law_type: string | undefined
    next_id: number | string | undefined
    region: string | undefined
    regulatory_references: string | undefined
    species?: string | undefined
    tags: string | undefined
    topic: string | undefined
    zone: string | undefined
  }

  // TODO Chech this type.
  type RegulatoryZoneFeatureProperties = {
    fishing_period: string
    gears: string
    id: string | undefined
    law_type: string
    next_id: string | undefined
    other_info: string | undefined
    region: string
    regulatory_references: string | undefined
    species: string | undefined
    tags: string | undefined
    topic: string
    zone: string
  }
  export type RegulatoryZoneGeoJsonFeature = Feature<Polygon, RegulatoryZoneFeatureProperties>
  export type RegulatoryZoneGeoJsonFeatureCollection = FeatureCollection<Polygon, RegulatoryZoneFeatureProperties>
}
