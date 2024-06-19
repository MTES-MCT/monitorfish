package fr.gouv.cnsp.monitorfish.domain.entities.logbook

enum class LogbookMessagePurpose {
    // TODO Find out what this purpose code means.
    ACS,

    /** Emergency. */
    ECY,

    /** Vessels grounded and called by the authorities. */
    GRD,

    /** Landing. */
    LAN,

    /** Other. */
    OTH,

    /** Refueling. */
    REF,

    /** Repair. */
    REP,

    /** Rest. */
    RES,

    /** Return for Scientific Research. */
    SCR,

    /** Sheltering. */
    SHE,

    /** Transhipment. */
    TRA,
}
