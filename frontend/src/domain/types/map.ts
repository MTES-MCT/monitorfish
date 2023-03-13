import type { InteractionListener, InteractionType } from '../entities/map/constants'
import type { Feature } from 'ol'

export type MapClickEvent = {
  ctrlKeyPressed: boolean
  feature: Feature | undefined
}

export type LastPositionVisibility = {
  hidden: number
  opacityReduced: number
}

export type InteractionTypeAndListener = {
  listener: InteractionListener
  type: InteractionType
}
