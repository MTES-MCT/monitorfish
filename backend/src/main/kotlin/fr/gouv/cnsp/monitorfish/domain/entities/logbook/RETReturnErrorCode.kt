package fr.gouv.cnsp.monitorfish.domain.entities.logbook

enum class RETReturnErrorCode(val number: String) {
    SUCCESS("000"),
    NO_AUTHORIZATION1("001"),
    CROSS_CHECK_FAILED("002"),
    NOT_IMPLEMENTED("003"),
    SYSTEM_DOWN("004"),
}
