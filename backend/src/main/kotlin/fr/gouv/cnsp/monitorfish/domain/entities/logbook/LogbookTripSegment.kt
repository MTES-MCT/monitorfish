package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import com.fasterxml.jackson.annotation.JsonProperty

data class LogbookTripSegment(
    val segment: String,
    @JsonProperty("segment_name")
    val segmentName: String,
)
