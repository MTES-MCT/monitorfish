package fr.gouv.cnsp.monitorfish.domain.entities.controls

enum class ControlType(val value: String) {
    SEA("Contrôle en mer"),
    LAND("Contrôle à la débarque"),
    AERIAL("Contrôle aérien"),
}
