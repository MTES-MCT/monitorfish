export const featureHas = (key: string) => ['==', ['get', key], 1]

export const featureHasNot = (key: string) => ['==', ['get', key], 0]

export const featurePropertyIsNotEmpty = (key: string) => ['!=', ['get', key, 'number'], 0]

export const stateIs = (key: string) => ['==', ['var', key], 1]

export const getFeatureProperty = (key: string) => ['get', key, 'color']
