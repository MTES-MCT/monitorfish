package fr.gouv.cnsp.monitorfish.domain.entities.reporting

enum class ReportingSource {
    OPS,
    SIP,
    UNIT,
    DML, // Kept for backward compatibility, now in otherSourceType
    SATELLITE,
    DIRM, // Kept for backward compatibility, now in otherSourceType
    OTHER,
}
