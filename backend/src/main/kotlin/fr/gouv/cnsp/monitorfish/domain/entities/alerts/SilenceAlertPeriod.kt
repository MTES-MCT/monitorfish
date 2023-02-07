package fr.gouv.cnsp.monitorfish.domain.entities.alerts

enum class SilenceAlertPeriod {
    THIS_OCCURRENCE,
    ONE_HOUR,
    TWO_HOURS,
    SIX_HOURS,
    TWELVE_HOURS,
    ONE_DAY,
    ONE_WEEK,
    ONE_MONTH,
    ONE_YEAR,
    CUSTOM,
}
