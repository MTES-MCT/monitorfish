package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.DEP
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.EOF
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.FAR
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSLastDepartureDateFound
import org.assertj.core.api.Assertions
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Import
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.transaction.annotation.Transactional
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Import(MapperConfiguration::class)
@RunWith(SpringRunner::class)
class JpaERSRepositoryITests : AbstractDBTests() {

    @Autowired
    private lateinit var jpaERSRepository: JpaERSRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("ers")?.clear()
    }

    @Test
    @Transactional
    fun `findLastDepartureDate Should return the last departure date When the CFR is given`() {
        // When
        val departureDate = jpaERSRepository.findLastDepartureDate("GBR000B14430", "", "")

        // Then
        assertThat(departureDate.toString()).isEqualTo("2019-10-11T02:06Z")
    }

    @Test
    @Transactional
    fun `findLastDepartureDate Should return the last departure date When the external marker is given`() {
        // When
        val departureDate = jpaERSRepository.findLastDepartureDate("", "AR865", "")

        // Then
        assertThat(departureDate.toString()).isEqualTo("2019-10-11T02:06Z")
    }

    @Test
    @Transactional
    fun `findLastDepartureDate Should return the last departure date When the IRCS is given`() {
        // When
        val departureDate = jpaERSRepository.findLastDepartureDate("", "", "MVGM5")

        // Then
        assertThat(departureDate.toString()).isEqualTo("2019-10-11T02:06Z")
    }

    @Test
    @Transactional
    fun `findLastDepartureDate Should throw an exception When no parameter is given`() {
        // When
        val throwable = catchThrowable { jpaERSRepository.findLastDepartureDate("", "", "") }

        // Then
        assertThat(throwable).isInstanceOf(NoERSLastDepartureDateFound::class.java)
        assertThat(throwable.message).contains("No departure date (DEP) found for the vessel.")
    }

    @Test
    @Transactional
    fun `findLastDepartureDate Should throw an exception When the vessel could not be found`() {
        // When
        val throwable = catchThrowable { jpaERSRepository.findLastDepartureDate("ARGH", "", "") }

        // Then
        assertThat(throwable).isInstanceOf(NoERSLastDepartureDateFound::class.java)
        assertThat(throwable.message).contains("No departure date (DEP) found for the vessel.")
    }

    @Test
    @Transactional
    fun `findAllMessagesAfterDepartureDate Should retrieve all messages When the CFR is given`() {
        // Given
        val lastDepartureDate = ZonedDateTime.of(2019, 10, 11, 2, 6, 0, 0, UTC)

        // When
        val messages = jpaERSRepository
                .findAllMessagesAfterDepartureDate(lastDepartureDate, "GBR000B14430", "", "")

        // Then
        assertThat(messages).hasSize(6)

        // Message FAR #1
        assertThat(messages[0].message).isInstanceOf(FAR::class.java)
        val farMessageOne = messages[0].message as FAR
        assertThat(farMessageOne.gear).isEqualTo("GTN")
        assertThat(farMessageOne.mesh).isEqualTo(100.0)
        assertThat(farMessageOne.catchDateTime.toString()).isEqualTo("2019-12-05T11:55:00Z")
        assertThat(farMessageOne.catches).hasSize(3)
        assertThat(farMessageOne.catches.first().weight).isEqualTo(2.0)
        assertThat(farMessageOne.catches.first().numberFish).isEqualTo(null)
        assertThat(farMessageOne.catches.first().species).isEqualTo("SCL")
        assertThat(farMessageOne.catches.first().faoZone).isEqualTo("27.8.a")
        assertThat(farMessageOne.catches.first().effortZone).isEqualTo("C")
        assertThat(farMessageOne.catches.first().economicZone).isEqualTo("FRA")
        assertThat(farMessageOne.catches.first().statisticalRectangle).isEqualTo("23E6")

        // Message EOF
        assertThat(messages[1].message).isInstanceOf(EOF::class.java)
        val eofMessage = messages[1].message as EOF
        assertThat(eofMessage.endOfFishingDateTime.toString()).isEqualTo("2019-12-03T12:16:00Z")

        // Message FAR #2
        assertThat(messages[2].message).isInstanceOf(FAR::class.java)
        val farMessageTwo = messages[2].message as FAR
        assertThat(farMessageTwo.gear).isEqualTo("GTN")
        assertThat(farMessageTwo.mesh).isEqualTo(100.0)
        assertThat(farMessageTwo.catchDateTime.toString()).isEqualTo("2019-01-26T11:24:00Z")
        assertThat(farMessageTwo.catches).hasSize(3)
        assertThat(farMessageTwo.catches.first().weight).isEqualTo(15.0)
        assertThat(farMessageTwo.catches.first().numberFish).isEqualTo(null)
        assertThat(farMessageTwo.catches.first().species).isEqualTo("BON")
        assertThat(farMessageTwo.catches.first().faoZone).isEqualTo("27.8.a")
        assertThat(farMessageTwo.catches.first().effortZone).isEqualTo("C")
        assertThat(farMessageTwo.catches.first().economicZone).isEqualTo("FRA")
        assertThat(farMessageTwo.catches.first().statisticalRectangle).isEqualTo("23E6")

        // Message COX
        assertThat(messages[3].messageType).isEqualTo("COX")
        assertThat(messages[3].message).isNull()

        // Message PNO
        assertThat(messages[4].message).isInstanceOf(PNO::class.java)
        val pnoMessage = messages[4].message as PNO
        assertThat(pnoMessage.port).isEqualTo("AEJAZ")
        assertThat(pnoMessage.purpose).isEqualTo("LAN")
        assertThat(pnoMessage.catchOnboard).hasSize(1)
        assertThat(pnoMessage.catchOnboard.first().weight).isEqualTo(2.0)
        assertThat(pnoMessage.catchOnboard.first().numberFish).isEqualTo(null)
        assertThat(pnoMessage.catchOnboard.first().species).isEqualTo("SOL")
        assertThat(pnoMessage.catchOnboard.first().faoZone).isEqualTo("27.8.a")
        assertThat(pnoMessage.catchOnboard.first().effortZone).isEqualTo("C")
        assertThat(pnoMessage.catchOnboard.first().economicZone).isEqualTo("FRA")
        assertThat(pnoMessage.catchOnboard.first().statisticalRectangle).isEqualTo("23E6")
        assertThat(pnoMessage.tripStartDate.toString()).isEqualTo("2019-10-11")
        assertThat(pnoMessage.predictedArrivalDateTime.toString()).isEqualTo("2019-10-11T12:15:00Z")

        // Message DEP
        assertThat(messages[5].message).isInstanceOf(DEP::class.java)
        val depMessage = messages[5].message as DEP
        assertThat(depMessage.gearOnboard).hasSize(1)
        assertThat(depMessage.gearOnboard.first().gear).isEqualTo("GTN")
        assertThat(depMessage.gearOnboard.first().mesh).isEqualTo(100.0)
        assertThat(depMessage.departurePort).isEqualTo("AEJAZ")
        assertThat(depMessage.anticipatedActivity).isEqualTo("FSH")
        assertThat(depMessage.departureDateTime.toString()).isEqualTo("2019-10-11T01:40:00Z")
    }
}
