import { useEffect } from 'react'

import type BaseLayer from 'ol/layer/Base'

/**
 * Controls a WebGL layer's visibility via opacity.
 * setVisible() cannot be used on WebGL layers as it causes the drawing context to crash.
 */
export function useWebGLLayerVisibility(layer: BaseLayer | undefined, isVisible: boolean) {
  useEffect(() => {
    if (!layer) {
      return
    }

    layer.setOpacity(isVisible ? 1 : 0)
  }, [layer, isVisible])
}
