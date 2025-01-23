package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

enum class InfractionCategory(
    val value: String,
) {
    FISHING("Pêche"),
    REGISTER("Registre Inter."),
    ENVIRONMENT("Environnement"),
    SAILOR("Gens de Mer"),
    MARITIME_NAVIGATION("Navigation Maritime"),
    MARITIME_SECURITY("Sécurité Maritime"),
    MARITIME_PORTS("Ports Maritimes"),
    SECURITY("Sécurité / Rôle"),
}
