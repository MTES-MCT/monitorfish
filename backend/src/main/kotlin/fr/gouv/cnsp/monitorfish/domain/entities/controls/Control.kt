package fr.gouv.cnsp.monitorfish.domain.entities.controls
import java.time.ZonedDateTime


data class Control(
        var id: Int,
        var vesselId: Int,
        var controller: Controller,
        var controlType: String? = null,
        var controlDatetimeUtc: ZonedDateTime? = null,
        var inputStartDatetimeUtc: ZonedDateTime? = null,
        var inputEndDatetimeUtc: ZonedDateTime? = null,
        var facade: String? = null,
        var longitude: Double? = null,
        var latitude: Double? = null,
        var portLocode: String? = null,
        var portName: String? = null,
        var missionOrder: Boolean? = null,
        var vesselTargeted: Boolean? = null,
        var cnspCalledUnit: Boolean? = null,
        var cooperative: Boolean? = null,
        var preControlComments: String? = null,
        var infraction: Boolean? = null,
        var infractions: List<Infraction> = listOf(),
        var diversion: Boolean? = null,
        var escortToQuay: Boolean? = null,
        var seizure: Boolean? = null,
        var seizureComments: String? = null,
        var postControlComments: String? = null,
        var gearControls: List<GearControl> = listOf())