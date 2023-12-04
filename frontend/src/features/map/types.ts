import type { FeatureWithCodeAndEntityId } from '../../libs/FeatureWithCodeAndEntityId'
import type { Geometry } from 'ol/geom'
import type VectorSource from 'ol/source/Vector'

export interface VectorSourceForFeatureWithCodeAndEntityId<G extends Geometry = Geometry> extends VectorSource<G> {
  addFeatures(features: Array<FeatureWithCodeAndEntityId<G>>): void
  forEachFeature<T>(callback: (feature: FeatureWithCodeAndEntityId<G>) => void): T | undefined
}
