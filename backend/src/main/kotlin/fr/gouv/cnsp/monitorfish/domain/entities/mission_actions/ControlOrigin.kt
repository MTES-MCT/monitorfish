package fr.gouv.cnsp.monitorfish.domain.entities.mission_actions

enum class ControlOrigin(val value: String) {
    POSEIDON_ENV("POSEIDON_ENV"),
    POSEIDON_FISH("POSEIDON_FISH"),
    MONITORENV("MONITORENV"),
    MONITORFISH("MONITORFISH"),
}
