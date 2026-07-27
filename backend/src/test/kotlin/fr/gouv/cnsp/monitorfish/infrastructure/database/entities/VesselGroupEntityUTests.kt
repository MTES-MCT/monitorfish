package fr.gouv.cnsp.monitorfish.infrastructure.database.entities

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.GroupType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.Sharing
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupFilters
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.ZonedDateTime

class VesselGroupEntityUTests {
    private val mapper = jacksonObjectMapper()

    private fun getDynamicVesselGroupEntity(isPriorityGroup: Boolean) =
        VesselGroupEntity(
            id = 1,
            isDeleted = false,
            name = "Dummy group",
            description = null,
            color = "#FFFFFF",
            pointsOfAttention = null,
            filters =
                mapper.writeValueAsString(
                    VesselGroupFilters(
                        hasLogbook = null,
                        lastControlAtSeaPeriod = null,
                        lastControlAtQuayPeriod = null,
                        lastPositionHoursAgo = null,
                        vesselSize = null,
                    ),
                ),
            vessels = null,
            sharing = Sharing.PRIVATE,
            sharedTo = listOf(),
            type = GroupType.DYNAMIC,
            isPriorityGroup = isPriorityGroup,
            createdBy = "dummy@email.gouv.fr",
            createdAtUtc = ZonedDateTime.now(),
        )

    private fun getFixedVesselGroupEntity(isPriorityGroup: Boolean) =
        VesselGroupEntity(
            id = 1,
            isDeleted = false,
            name = "Dummy group",
            description = null,
            color = "#FFFFFF",
            pointsOfAttention = null,
            filters = null,
            vessels = mapper.writeValueAsString(listOf<Any>()),
            sharing = Sharing.PRIVATE,
            sharedTo = listOf(),
            type = GroupType.FIXED,
            isPriorityGroup = isPriorityGroup,
            createdBy = "dummy@email.gouv.fr",
            createdAtUtc = ZonedDateTime.now(),
        )

    @Test
    fun `toVesselGroup should map isPriorityGroup to true for a priority dynamic group`() {
        val vesselGroup = getDynamicVesselGroupEntity(isPriorityGroup = true).toVesselGroup(mapper)

        assertThat(vesselGroup.isPriorityGroup).isTrue
    }

    @Test
    fun `toVesselGroup should map isPriorityGroup to false for a non-priority dynamic group`() {
        val vesselGroup = getDynamicVesselGroupEntity(isPriorityGroup = false).toVesselGroup(mapper)

        assertThat(vesselGroup.isPriorityGroup).isFalse
    }

    @Test
    fun `toVesselGroup should map isPriorityGroup to true for a priority fixed group`() {
        val vesselGroup = getFixedVesselGroupEntity(isPriorityGroup = true).toVesselGroup(mapper)

        assertThat(vesselGroup.isPriorityGroup).isTrue
    }

    @Test
    fun `toVesselGroup should map isPriorityGroup to false for a non-priority fixed group`() {
        val vesselGroup = getFixedVesselGroupEntity(isPriorityGroup = false).toVesselGroup(mapper)

        assertThat(vesselGroup.isPriorityGroup).isFalse
    }

    @Test
    fun `fromDynamicVesselGroup should carry over isPriorityGroup from the domain object`() {
        val dynamicVesselGroup =
            DynamicVesselGroup(
                id = 1,
                name = "Dummy group",
                isDeleted = false,
                description = null,
                pointsOfAttention = null,
                color = "#FFFFFF",
                sharing = Sharing.PRIVATE,
                isPriorityGroup = true,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                filters =
                    VesselGroupFilters(
                        hasLogbook = null,
                        lastControlAtSeaPeriod = null,
                        lastControlAtQuayPeriod = null,
                        lastPositionHoursAgo = null,
                        vesselSize = null,
                    ),
            )

        val entity = VesselGroupEntity.fromDynamicVesselGroup(mapper, dynamicVesselGroup)

        assertThat(entity.isPriorityGroup).isTrue
    }

    @Test
    fun `fromFixedVesselGroup should carry over isPriorityGroup from the domain object`() {
        val fixedVesselGroup =
            FixedVesselGroup(
                id = 1,
                name = "Dummy group",
                isDeleted = false,
                description = null,
                pointsOfAttention = null,
                color = "#FFFFFF",
                sharing = Sharing.PRIVATE,
                isPriorityGroup = true,
                createdBy = "dummy@email.gouv.fr",
                createdAtUtc = ZonedDateTime.now(),
                vessels = listOf(),
            )

        val entity = VesselGroupEntity.fromFixedVesselGroup(mapper, fixedVesselGroup)

        assertThat(entity.isPriorityGroup).isTrue
    }
}
