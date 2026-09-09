package fr.gouv.cnsp.monitorfish.domain.entities.reporting

/**
 * Who a reporting comes from, as displayed in the "Source" column and filter.
 *
 * Unlike [ReportingSource] it covers alerts, which have no source of their own, and folds the
 * legacy [ReportingSource.DML] and [ReportingSource.DIRM] values — now carried by
 * [OtherSource] — into [OTHER].
 */
enum class ReportingOrigin {
    ALERT,
    OPS,
    SIP,
    UNIT,
    SATELLITE,
    OTHER,
    ;

    companion object {
        fun fromReporting(reporting: Reporting): ReportingOrigin =
            when (reporting) {
                is Reporting.Alert -> ALERT
                is Reporting.InfractionSuspicion -> fromSource(reporting.reportingSource)
                is Reporting.Observation -> fromSource(reporting.reportingSource)
            }

        fun fromSource(source: ReportingSource): ReportingOrigin =
            when (source) {
                ReportingSource.OPS -> OPS
                ReportingSource.SIP -> SIP
                ReportingSource.UNIT -> UNIT
                ReportingSource.SATELLITE -> SATELLITE
                ReportingSource.OTHER, ReportingSource.DML, ReportingSource.DIRM -> OTHER
            }
    }
}
