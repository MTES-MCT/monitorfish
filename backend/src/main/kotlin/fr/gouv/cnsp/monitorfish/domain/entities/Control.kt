package fr.gouv.cnsp.monitorfish.domain.entities
import java.time.ZonedDateTime


data class Control(
    var id: Int,
    var vesselId: Int,
    var controllerId: Int?,
    var controlType: String? = null,
    var controlDatetimeUtc: ZonedDateTime? = null,
    var inputStartDatetimeUtc: ZonedDateTime? = null,
    var inputEndDatetimeUtc: ZonedDateTime? = null,
    var facade: String? = null,
    var longitude: Double? = null,
    var latitude: Double? = null,
    var portLocode: String? = null,
    var missionOrder: Boolean? = null,
    var vesselTargeted: Boolean? = null,
    var cnspCalledUnit: Boolean? = null,
    var cooperative: Boolean? = null,
    var preControlComments: String? = null,
    var infraction: Boolean? = null,
    var infractionIds: List<Int>? = null,
    var diversion: Boolean? = null,
    var escortToQuay: Boolean? = null,
    var seizure: Boolean? = null,
    var seizureComments: String? = null,
    var postControlComments: String? = null,
    var gearControls: String? = null)