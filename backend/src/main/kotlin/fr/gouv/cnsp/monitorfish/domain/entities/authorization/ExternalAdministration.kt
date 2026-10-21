package fr.gouv.cnsp.monitorfish.domain.entities.authorization

/**
 * Administrations outside the ministries reached by Cerbère, whose agents are allowed by email list.
 */
enum class ExternalAdministration {
    DOUANE,
    GENDARMERIE_MARITIME,
    GENDARMERIE_NATIONALE,
}
