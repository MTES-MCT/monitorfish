import React from 'react'

import { LayerSliceNamespace } from '../domain/entities/layers/types'

export const NamespaceContext = React.createContext<LayerSliceNamespace>(LayerSliceNamespace.homepage)
