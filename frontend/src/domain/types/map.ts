import type { FeatureWithCodeAndEntityId } from '../../libs/FeatureWithCodeAndEntityId'
import type { InteractionListener, InteractionType } from '../entities/map/constants'
import type { FeatureLike } from 'ol/Feature'

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
