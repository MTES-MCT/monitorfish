export const mapToRegulatoryZone = properties => {
  return {
    layerName: properties.layer_name,
    prohibitedGears: properties.engins_interdits,
    gears: properties.engins,
    zone: properties.zones,
    species: properties.especes,
    prohibitedSpecies: properties.especes_interdites,
    regulatoryReferences: properties.references_reglementaires,
    permissions: properties.autorisations,
    bycatch: properties.captures_accessoires,
    openingDate: properties.date_ouverture,
    closingDate: properties.date_fermeture,
    mandatoryDocuments: properties.documents_obligatoires,
    state: properties.etat,
    prohibitions: properties.interdictions,
    technicalMeasures: properties.mesures_techniques,
    period: properties.periodes,
    quantity: properties.quantites,
    size: properties.taille,
    region: properties.region,
    seafront: properties.facade,
    obligations: properties.obligations,
    rejections: properties.rejets,
    deposit: properties.gisement
  }
}
