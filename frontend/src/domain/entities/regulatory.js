export const mapToRegulatoryZone = properties => {
    return {
        layerName: properties.layer_name,
        gears: properties.engins,
        zone: properties.zones,
        species: properties.especes,
        regulatoryReferences: properties.references_reglementaires,
        permissions: properties.autorisations,
        bycatch: properties.captures_accessoires,
        openingDate: properties.date_fermeture,
        closingDate: properties.date_ouverture,
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
        rejections: properties.rejets
    }
}