package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import fr.gouv.cnsp.monitorfish.domain.entities.controls.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import java.time.ZonedDateTime

class Reporting(
    val id: Int? = null,
    val type: ReportingType,
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
    var underCharter: Boolean? = null
) {
    companion object {
        fun getSeaFrontFromDML(dml: String) = when (dml) {
            "DML 62/80" -> Facade.MEMN.name
            "DML 76" -> Facade.MEMN.name
            "DML 76/27" -> Facade.MEMN.name
            "DML 14" -> Facade.MEMN.name
            "DML 50" -> Facade.MEMN.name
            "DML 35" -> Facade.NAMO.name
            "DML 22" -> Facade.NAMO.name
            "DML 29" -> Facade.NAMO.name
            "DML 56" -> Facade.NAMO.name
            "DML 44" -> Facade.NAMO.name
            "DML 85" -> Facade.NAMO.name
            "DML 17" -> Facade.SA.name
            "DML 33" -> Facade.SA.name
            "DML 64/40" -> Facade.SA.name
            "DML 66/11" -> Facade.MED.name
            "DML 34/30" -> Facade.MED.name
            "DML 13" -> Facade.MED.name
            "DML 83" -> Facade.MED.name
            "DML 06" -> Facade.MED.name
            "DML 2a" -> Facade.MED.name
            "DML 2b" -> Facade.MED.name
            else -> Facade.UNDEFINED.name
        }

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
