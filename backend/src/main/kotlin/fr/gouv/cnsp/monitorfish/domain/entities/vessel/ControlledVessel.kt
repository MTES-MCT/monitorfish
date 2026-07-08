package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase

data class ControlledVessel(
    val controlledVessel: Vessel,
    val groups: List<VesselGroupBase>,
    val tripReportings: List<Reporting>,
)
