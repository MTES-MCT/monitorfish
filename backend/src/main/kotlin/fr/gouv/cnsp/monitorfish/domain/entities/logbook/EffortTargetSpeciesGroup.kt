package fr.gouv.cnsp.monitorfish.domain.entities.logbook

enum class EffortTargetSpeciesGroup(val value: String) {
    DEM("Démersal"),
    SCA("Coquille"),
    CRA("Crabe comestible et araignée de mer"),
    PEL("Pélagique"),
    SAL("Truite de mer saumonée et poisson d'eau douce"),
}
