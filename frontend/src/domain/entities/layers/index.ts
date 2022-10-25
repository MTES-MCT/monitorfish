/**
 *
 * @param {Object} layer
 * @param { String } layer.type
 * @param { String | null } layer.topic
 * @param { String | null } layer.zone
 * @returns String
 */
export const getLayerNameNormalized = layer => [layer.type, layer.topic, layer.zone].filter(Boolean).join(':')
