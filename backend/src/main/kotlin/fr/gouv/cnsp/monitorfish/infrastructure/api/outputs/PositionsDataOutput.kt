package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.Position

data class PositionsDataOutput(val positions: List<PositionDataOutput>) {
    companion object {
        fun fromPositions(positions: List<Position>): PositionsDataOutput {
            return PositionsDataOutput(
                    positions = positions.map {
                        it?.let {
                            PositionDataOutput(
                                    internalReferenceNumber = it.internalReferenceNumber,
                                    IRCS = it.IRCS,
                                    MMSI = it.MMSI,
                                    externalReferenceNumber = it.externalReferenceNumber,
                                    dateTime = it.dateTime,
                                    latitude = it.latitude,
                                    longitude = it.longitude,
                                    vesselName = it.vesselName,
                                    speed = it.speed,
                                    course = it.course,
                                    flagState = it.flagState,
                                    destination = it.destination,
                                    from = it.from,
                                    tripNumber = it.tripNumber,
                                    positionType = it.positionType
                            )
                        }
                    }
            )
        }
    }
}
