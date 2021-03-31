package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.Control
import java.time.ZonedDateTime

data class ControlDataOutput(
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
        var postControlComments: String? = null) {
    companion object {
        fun fromControl(control: Control) = ControlDataOutput(
                id = control.id,
                vesselId = control.vesselId,
                controllerId = control.controllerId,
                controlType = control.controlType,
                controlDatetimeUtc = control.controlDatetimeUtc,
                inputStartDatetimeUtc = control.inputStartDatetimeUtc,
                inputEndDatetimeUtc = control.inputEndDatetimeUtc,
                facade = control.facade,
                longitude = control.longitude,
                latitude = control.latitude,
                portLocode = control.portLocode,
                missionOrder = control.missionOrder,
                vesselTargeted = control.vesselTargeted,
                cnspCalledUnit = control.cnspCalledUnit,
                cooperative = control.cooperative,
                preControlComments = control.preControlComments,
                infraction = control.infraction,
                infractionIds = control.infractionIds,
                diversion = control.diversion,
                escortToQuay = control.escortToQuay,
                seizure = control.seizure,
                seizureComments = control.seizureComments,
                postControlComments = control.postControlComments
        )
    }
}
