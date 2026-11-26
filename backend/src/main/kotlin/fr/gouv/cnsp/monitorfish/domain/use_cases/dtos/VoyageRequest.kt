package fr.gouv.cnsp.monitorfish.domain.use_cases.dtos

enum class VoyageRequest {
    LAST,
    PREVIOUS,
    NEXT,
    EQUALS,

    /** The trip during which the vessel was at sea at a past date, e.g. when replaying positions. */
    AT_DATE_TIME,
}
