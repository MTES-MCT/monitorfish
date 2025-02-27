package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.dtos

import java.time.ZonedDateTime

data class DatesOfVesselTrackDepth(
    val from: ZonedDateTime,
    val to: ZonedDateTime,
    val isTrackDepthModified: Boolean,
)
