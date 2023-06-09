package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.fleet_segment.FleetSegment
import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields

interface FleetSegmentRepository {
    // For V0.222.0__Insert_dummy_facade_areas.sql purpose
    fun findAll(): List<FleetSegment>
    fun findAllByYear(year: Int): List<FleetSegment>

    fun update(segment: String, fields: CreateOrUpdateFleetSegmentFields, year: Int): FleetSegment
    fun delete(segment: String, year: Int): List<FleetSegment>
    fun create(segment: FleetSegment): FleetSegment
    fun findYearEntries(): List<Int>
    fun addYear(currentYear: Int, nextYear: Int)
}
