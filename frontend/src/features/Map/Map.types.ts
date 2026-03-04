import type { FeatureWithCodeAndEntityId } from '../../libs/FeatureWithCodeAndEntityId'
import type { LayerType, InteractionListener, InteractionType } from '@features/Map/constants'
import type { Regulation } from '@features/Regulation/Regulation.types'
import type { GearRegulation, RegulatoryZone } from '@features/Regulation/types'
import type { Feature } from 'ol'
import type { FeatureLike } from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type VectorLayer from 'ol/layer/Vector'
import type VectorImageLayer from 'ol/layer/VectorImage'
import type WebGLPointsLayer from 'ol/layer/WebGLPoints'

export namespace MonitorFishMap {
  export type MapClick = {
    ctrlKeyPressed: boolean
    feature: FeatureLike | FeatureWithCodeAndEntityId | undefined
  }

  export type LastPositionVisibility = {
    hidden: number
    opacityReduced: number
  }

  export type InteractionTypeAndListener = {
    listener: InteractionListener
    type: InteractionType
  }

  export type TopicContainingMultipleZones = {
    regulatoryZones: RegulatoryZone[]
    type: string
  }

  // TODO Maybe rename this type.
  export type LayerToFeatures = {
    area: number
    center: number[]
    features: Regulation.RegulatoryZoneGeoJsonFeature
    name: string
    simplifiedFeatures: string | null
  }

  /** @deprecated Use `layer.get('code')` instead of `layer.name`. */
  export type VectorLayerWithName = VectorLayer<Feature<Geometry>>

  /** @deprecated Use `layer.get('code')` instead of `layer.name`. */
  export type VectorImageLayerWithName = VectorImageLayer<Feature<Geometry>>

  /** @deprecated Use `layer.get('code')` instead of `layer.name`. */
  export type WebGLPointsLayerWithName = WebGLPointsLayer<any>

  export interface MonitorFishLayerOLProperties {
    code: string
    isClickable?: boolean
    isHoverable?: boolean
    isIntersectable?: boolean
    zoneNamePropertyKey?: string
  }

  export enum MonitorFishLayer {
    BASE_LAYER = 'BASE_LAYER',
    CUSTOM = 'CUSTOM',
    DRAW = 'DRAW',
    FILTERED_VESSELS = 'FILTERED_VESSELS',
    INTEREST_POINT = 'INTEREST_POINT',
    MEASUREMENT = 'MEASUREMENT',
    MISSIONS_LABEL = 'MISSIONS_LABEL',
    MISSION_ACTION_SELECTED = 'MISSION_ACTION_SELECTED',
    MISSION_HOVER = 'MISSION_HOVER',
    MISSION_PIN_POINT = 'MISSION_PIN_POINT',
    MISSION_SELECTED = 'MISSION_SELECTED',
    REGULATORY = 'REGULATORY',
    REGULATORY_PREVIEW = 'REGULATORY_PREVIEW',
    SELECTED_VESSEL = 'SELECTED_VESSEL',
    STATION = 'STATION',
    VESSELS = 'VESSELS_POINTS',
    VESSELS_LABEL = 'VESSELS_LABEL',
    VESSEL_ALERT = 'VESSEL_ALERT',
    VESSEL_ALERT_AND_BEACON_MALFUNCTION = 'VESSEL_ALERT_AND_BEACON_MALFUNCTION',
    VESSEL_BEACON_MALFUNCTION = 'VESSEL_BEACON_MALFUNCTION',
    VESSEL_ESTIMATED_POSITION = 'VESSEL_ESTIMATED_POSITION',
    VESSEL_INFRACTION_SUSPICION = 'VESSEL_INFRACTION_SUSPICION',
    VESSEL_TRACK = 'VESSEL_TRACK'
  }

  export enum AdminLayer {
    AEM = 'AEM',
    CCAMLR = 'CCAMLR',
    EEZ = 'EEZ',
    FAO = 'FAO',
    ICCAT = 'ICCAT',
    IOTC = 'IOTC',
    NAFO = 'NAFO',
    NEAFC = 'NEAFC',
    SIOFA = 'SIOFA',
    SIX_MILES = 'SIX_MILES',
    THREE_MILES = 'THREE_MILES',
    TWELVE_MILES = 'TWELVE_MILES',
    cgpm_areas = 'cgpm_areas',
    cgpm_statistical_rectangles_areas = 'cgpm_statistical_rectangles_areas',
    cormoran = 'cormoran',
    eaux_occidentales_australes = 'eaux_occidentales_australes',
    eaux_occidentales_septentrionales = 'eaux_occidentales_septentrionales',
    eaux_union_dans_oi_et_atl_ouest = 'eaux_union_dans_oi_et_atl_ouest',
    effort_zones_areas = 'effort_zones_areas',
    mer_baltique = 'mer_baltique',
    mer_celtique = 'mer_celtique',
    mer_du_nord = 'mer_du_nord',
    mer_mediterranee = 'mer_mediterranee',
    mer_noire = 'mer_noire',
    navigation_category_five = 'navigation_category_five',
    navigation_category_four = 'navigation_category_four',
    navigation_category_three = 'navigation_category_three',
    navigation_category_two = 'navigation_category_two',
    rectangles_stat = 'rectangles_stat',
    saltwater_limit = 'saltwater_limit',
    situations = 'situations',
    transversal_sea_limit = 'transversal_sea_limit'
  }

  export type CodeAndName = {
    code: string
    name: string
  }

  export type AdminShowableLayer = {
    code: string
    group?: CodeAndName | undefined
    hasFetchableZones?: boolean
    hasSearchableZones?: boolean
    isIntersectable?: boolean
    name: string
    zoneNamePropertyKey?: string
  }

  export type ShowableLayer = {
    code: MonitorFishLayer | string
    isIntersectable?: boolean
    name?: string
    type: LayerType
    zIndex?: number
  }

  // TODO Check and split this type.
  // TODO Strict-type all the constants/params using it. It's way too partial (TS migration) which complicates the type-checking/guarding.
  export type ShowedLayer = {
    gears?: GearRegulation
    id?: number | string | undefined
    layerName?: string
    topic?: string | undefined
    type?: string | undefined
    zone?: string | undefined
  }
}
