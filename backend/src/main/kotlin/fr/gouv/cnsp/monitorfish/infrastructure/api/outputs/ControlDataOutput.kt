package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.controls.Control
import java.time.ZonedDateTime

data class ControlDataOutput(
        var controller: ControllerDataOutput? = null,
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
        var infractions: List<InfractionDataOutput>,
        var diversion: Boolean? = null,
        var escortToQuay: Boolean? = null,
        var seizure: Boolean? = null,
        var seizureComments: String? = null,
        var postControlComments: String? = null,
        var gearControls: List<GearControlDataOutput>) {
    companion object {
        fun fromControl(control: Control) = ControlDataOutput(
                controller = ControllerDataOutput.fromController(control.controller),
                controlType = control.controlType,
                controlDatetimeUtc = control.controlDatetimeUtc,
                inputStartDatetimeUtc = control.inputStartDatetimeUtc,
                inputEndDatetimeUtc = control.inputEndDatetimeUtc,
                facade = control.facade,
                longitude = control.longitude,
                latitude = control.latitude,
                portLocode = control.portLocode,
                portName = control.portName,
                missionOrder = control.missionOrder,
                vesselTargeted = control.vesselTargeted,
                cnspCalledUnit = control.cnspCalledUnit,
                cooperative = control.cooperative,
                preControlComments = control.preControlComments,
                infraction = control.infraction,
                infractions = control.infractions.map { InfractionDataOutput.fromInfraction(it) },
                diversion = control.diversion,
                escortToQuay = control.escortToQuay,
                seizure = control.seizure,
                seizureComments = control.seizureComments,
                postControlComments = control.postControlComments,
                gearControls = control.gearControls.map{ GearControlDataOutput.fromGearControl(it) }
        )
    }
}
