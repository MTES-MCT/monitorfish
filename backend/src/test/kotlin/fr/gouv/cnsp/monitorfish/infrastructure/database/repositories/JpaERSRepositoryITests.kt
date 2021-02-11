package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.*
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
        assertThat(messages).hasSize(10)

        assertThat(messages[0].message).isInstanceOf(LAN::class.java)
        val lanMessage = messages[0].message as LAN
        assertThat(lanMessage.port).isEqualTo("AEAJM")
        assertThat(lanMessage.catchLanded).hasSize(5)
        assertThat(lanMessage.landingDateTime.toString()).isEqualTo("2019-10-22T11:06Z[UTC]")

        assertThat(messages[1].message).isInstanceOf(RTP::class.java)
        val rtpMessage = messages[1].message as RTP
        assertThat(rtpMessage.dateTime).isEqualTo("2019-10-21T11:12:00Z[UTC]")

        assertThat(messages[2].message).isInstanceOf(PNO::class.java)
        val pnoMessage = messages[2].message as PNO
        assertThat(pnoMessage.port).isEqualTo("AEJAZ")
        assertThat(pnoMessage.purpose).isEqualTo("LAN")
        assertThat(pnoMessage.catchOnboard).hasSize(4)
        assertThat(pnoMessage.catchOnboard.first().weight).isEqualTo(20.0)
        assertThat(pnoMessage.catchOnboard.first().numberFish).isEqualTo(null)
        assertThat(pnoMessage.catchOnboard.first().species).isEqualTo("SLS")
        assertThat(pnoMessage.catchOnboard.first().faoZone).isEqualTo("27.8.a")
        assertThat(pnoMessage.catchOnboard.first().effortZone).isEqualTo("C")
        assertThat(pnoMessage.catchOnboard.first().economicZone).isEqualTo("FRA")
        assertThat(pnoMessage.catchOnboard.first().statisticalRectangle).isEqualTo("23E6")
        assertThat(pnoMessage.tripStartDate.toString()).isEqualTo("2019-10-11")
        assertThat(pnoMessage.predictedArrivalDateTime.toString()).isEqualTo("2019-10-21T08:16Z[UTC]")

        assertThat(messages[3].message).isInstanceOf(EOF::class.java)
        val eofMessage = messages[3].message as EOF
        assertThat(eofMessage.endOfFishingDateTime.toString()).isEqualTo("2019-10-20T12:16Z[UTC]")

        assertThat(messages[4].message).isInstanceOf(DIS::class.java)
        val disMessage = messages[4].message as DIS
        assertThat(disMessage.catches).hasSize(2)
        assertThat(disMessage.catches.first().weight).isEqualTo(5.0)
        assertThat(disMessage.catches.first().numberFish).isEqualTo(1.0)
        assertThat(disMessage.catches.first().species).isEqualTo("NEP")

        assertThat(messages[5].message).isInstanceOf(FAR::class.java)
        val farMessageOne = messages[5].message as FAR
        assertThat(farMessageOne.gear).isEqualTo("GTN")
        assertThat(farMessageOne.mesh).isEqualTo(100.0)
        assertThat(farMessageOne.catchDateTime.toString()).isEqualTo("2019-10-17T11:32Z[UTC]")
        assertThat(farMessageOne.catches).hasSize(4)
        assertThat(farMessageOne.catches.first().weight).isEqualTo(1500.0)
        assertThat(farMessageOne.catches.first().numberFish).isEqualTo(null)
        assertThat(farMessageOne.catches.first().species).isEqualTo("BON")
        assertThat(farMessageOne.catches.first().faoZone).isEqualTo("27.8.a")
        assertThat(farMessageOne.catches.first().effortZone).isEqualTo("C")
        assertThat(farMessageOne.catches.first().economicZone).isEqualTo("FRA")
        assertThat(farMessageOne.catches.first().statisticalRectangle).isEqualTo("23E6")

        assertThat(messages[6].messageType).isEqualTo("COE")
        assertThat(messages[6].message).isNull()

        assertThat(messages[7].message).isInstanceOf(FAR::class.java)
        val farMessageTwo = messages[7].message as FAR
        assertThat(farMessageTwo.gear).isEqualTo("GTN")
        assertThat(farMessageTwo.mesh).isEqualTo(100.0)
        assertThat(farMessageTwo.catchDateTime.toString()).isEqualTo("2019-12-05T11:55Z[UTC]")
        assertThat(farMessageTwo.catches).hasSize(4)
        assertThat(farMessageTwo.catches.first().weight).isEqualTo(20.0)
        assertThat(farMessageTwo.catches.first().numberFish).isEqualTo(null)
        assertThat(farMessageTwo.catches.first().species).isEqualTo("SLS")
        assertThat(farMessageTwo.catches.first().faoZone).isEqualTo("27.8.a")
        assertThat(farMessageTwo.catches.first().effortZone).isEqualTo("C")
        assertThat(farMessageTwo.catches.first().economicZone).isEqualTo("FRA")
        assertThat(farMessageTwo.catches.first().statisticalRectangle).isEqualTo("23E6")

        assertThat(messages[8].messageType).isEqualTo("COX")
        assertThat(messages[8].message).isNull()

        assertThat(messages[9].message).isInstanceOf(DEP::class.java)
        val depMessage = messages[9].message as DEP
        assertThat(depMessage.gearOnboard).hasSize(1)
        assertThat(depMessage.gearOnboard.first().gear).isEqualTo("GTN")
        assertThat(depMessage.gearOnboard.first().mesh).isEqualTo(100.0)
        assertThat(depMessage.departurePort).isEqualTo("AEJAZ")
        assertThat(depMessage.anticipatedActivity).isEqualTo("FSH")
        assertThat(depMessage.departureDateTime.toString()).isEqualTo("2019-10-11T01:40Z[UTC]")
    }
}
