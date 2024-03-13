package fr.gouv.cnsp.monitorfish.domain.entities.logbook

enum class LogbookOperationType {
    /** Transmission. */
    DAT,

    /** Correction. */
    COR,

    /** Suppression. */
    DEL,

    /** Acquittement. */
    RET,
}
