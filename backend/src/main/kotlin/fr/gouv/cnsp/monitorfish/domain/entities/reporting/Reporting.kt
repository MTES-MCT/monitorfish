package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

data class Reporting(
    val id: Int? = null,
    val type: ReportingType,
    val vesselId: Int? = null,
    val vesselName: String? = null,
    val internalReferenceNumber: String? = null,
    val externalReferenceNumber: String? = null,
    val ircs: String? = null,
    val vesselIdentifier: VesselIdentifier? = null,
    val creationDate: ZonedDateTime,
    val validationDate: ZonedDateTime? = null,
    val value: ReportingValue,
    val isArchived: Boolean,
    val isDeleted: Boolean,
    var infraction: Infraction? = null,
    var underCharter: Boolean? = null,
    val latitude: Double? = null,
    val longitude: Double? = null
) {
    companion object {
        fun checkReportingActorAndFieldsRequirements(value: InfractionSuspicionOrObservationType) = when (value.reportingActor) {
            ReportingActor.OPS -> require(!value.authorTrigram.isNullOrEmpty()) {
                "An author trigram must be set"
            }
            ReportingActor.SIP -> require(!value.authorTrigram.isNullOrEmpty()) {
                "An author trigram must be set"
            }
            ReportingActor.UNIT -> require(!value.unit.isNullOrEmpty()) {
                "An unit must be set"
            }
            ReportingActor.DML -> require(!value.authorContact.isNullOrEmpty()) {
                "An author contact must be set"
            }
            ReportingActor.DIRM -> require(!value.authorContact.isNullOrEmpty()) {
                "An author contact must be set"
            }
            ReportingActor.OTHER -> require(!value.authorContact.isNullOrEmpty()) {
                "An author contact must be set"
            }
        }
    }
}
