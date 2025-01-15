package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.responses

import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.ControlUnitResourceType
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.dtos.FullControlUnitResource
import kotlinx.serialization.Serializable

@Serializable
data class FullControlUnitResourceDataResponse(
    val id: Int,
    val controlUnit: ControlUnitDataResponse,
    val controlUnitId: Int,
    val isArchived: Boolean,
    val name: String,
    val note: String?,
    val photo: ByteArray?,
    val station: StationDataResponse,
    val stationId: Int,
    val type: ControlUnitResourceType,
) {
    fun toFullControlUnitResource(): FullControlUnitResource =
        FullControlUnitResource(
            id = id,
            controlUnit = controlUnit.toControlUnit(),
            controlUnitId = controlUnitId,
            isArchived = isArchived,
            name = name,
            note = note,
            photo = photo,
            station = station.toStation(),
            stationId = stationId,
            type = type,
        )
}
