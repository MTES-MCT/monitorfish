package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.beacon_malfunctions.Beacon

data class VesselAndBeacon(
    val vessel: Vessel,
    val beacon: Beacon? = null,
)
