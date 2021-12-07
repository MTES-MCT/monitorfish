package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.beacons_status.Stage
import fr.gouv.cnsp.monitorfish.domain.entities.beacons_status.VesselStatus
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional

@RunWith(SpringRunner::class)
class JpaBeaconStatusesRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaBeaconStatusesRepository: JpaBeaconStatusesRepository

    @Test
    @Transactional
    fun `findAll Should return all beacon statuses`() {
        // When
        val gears = jpaBeaconStatusesRepository.findAll()

        assertThat(gears).hasSize(4)
        assertThat(gears.first().cfr).isEqualTo("FAK000999999")
        assertThat(gears.first().stage).isEqualTo(Stage.INITIAL_ENCOUNTER)
        assertThat(gears.first().vesselStatus).isEqualTo(VesselStatus.AT_SEA)
    }

}
