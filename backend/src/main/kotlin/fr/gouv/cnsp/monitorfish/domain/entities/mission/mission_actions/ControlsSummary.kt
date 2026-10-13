package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

import fr.gouv.cnsp.monitorfish.domain.entities.rapportnav.Inquiry

data class ControlsSummary(
    val vesselId: Int,
    val numberOfDiversions: Int,
    val numberOfControlsWithSomeGearsSeized: Int,
    val numberOfControlsWithSomeSpeciesSeized: Int,
    val controls: List<MissionAction>,
    val inquiries: List<Inquiry>,
)
