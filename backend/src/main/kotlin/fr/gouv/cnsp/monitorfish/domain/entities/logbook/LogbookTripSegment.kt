package fr.gouv.cnsp.monitorfish.domain.entities.logbook

import com.fasterxml.jackson.annotation.JsonProperty

data class LogbookTripSegment(
    @JsonProperty("segment")
    val code: String,
    @JsonProperty("segmentName")
    val name: String,
)
