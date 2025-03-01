package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment

interface FleetSegmentRepository {
    // For test purpose
    fun findAll(): List<FleetSegment>

    fun findAllByYear(year: Int): List<FleetSegment>

    fun update(
        segment: String,
        updatedSegment: FleetSegment,
    ): FleetSegment

    fun delete(
        segment: String,
        year: Int,
    ): List<FleetSegment>

    fun save(segment: FleetSegment): FleetSegment

    fun findYearEntries(): List<Int>

    fun addYear(
        currentYear: Int,
        nextYear: Int,
    )

    fun findAllSegmentsGearsWithRequiredMesh(year: Int): List<String>
}
