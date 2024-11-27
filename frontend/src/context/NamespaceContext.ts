import { MainMap } from '@features/MainMap/MainMap.types'
import React from 'react'

export const NamespaceContext = React.createContext<MainMap.LayerSliceNamespace>(MainMap.LayerSliceNamespace.homepage)
