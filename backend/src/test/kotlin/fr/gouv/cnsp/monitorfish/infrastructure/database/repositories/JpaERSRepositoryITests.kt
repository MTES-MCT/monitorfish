package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.*
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.AfterEach
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

    @AfterEach
    fun after() {
        jpaERSRepository.deleteAll()
    }

    /**
     *                               Trips overlap in test data (see V666.5__Insert_ers.sql)
     *
     *        <- 2019-01-18T11:45Z
     *        +----------------------------------+
     *        | Trip number 13                   |
     *        +----------------------------------+
     *                        2019-02-23T13:08Z ->
     *
     *                                <- 2019-02-17T01:05Z
     *                                +--------------------------------------+
     *                                | Trip number 14                       |
     *                                +--------------------------------------+
     *                                                    2019-10-15T12:01Z ->
     *
     *                                                                            <- 2019-10-11T02:06Z
     *                                                                            +------------------------+
     *                                                                            | Trip number 15         |
     *                                                                            +------------------------+
     *                                                                                  2019-10-22T11:06Z ->
     */

    @Test
    @Transactional
    fun `findLastTripBefore Should return the last departure date When the CFR is given`() {
        // When
        val lastTrip = jpaERSRepository.findLastTripBeforeDateTime("FAK000999999", ZonedDateTime.now())

        // Then
        assertThat(lastTrip.startDate.toString()).isEqualTo("2019-10-11T02:06Z")
        assertThat(lastTrip.tripNumber).isEqualTo(9463715)
    }

    @Test
    @Transactional
    fun `findLastTripBefore Should throw an exception When no parameter is given`() {
        // When
        val throwable = catchThrowable { jpaERSRepository.findLastTripBeforeDateTime("", ZonedDateTime.now()) }

        // Then
        assertThat(throwable).isInstanceOf(NoLogbookFishingTripFound::class.java)
        assertThat(throwable.message).contains("No trip found found for the vessel.")
    }

    @Test
    @Transactional
    fun `findLastTripBefore Should throw an exception When the vessel could not be found`() {
        // When
        val throwable = catchThrowable { jpaERSRepository.findLastTripBeforeDateTime("ARGH", ZonedDateTime.now()) }

        // Then
        assertThat(throwable).isInstanceOf(NoLogbookFishingTripFound::class.java)
        assertThat(throwable.message).contains("No trip found found for the vessel.")
    }

    @Test
    @Transactional
    fun `findTripBeforeTripNumber Should return the previous trip number When there is an overlap between the current and previous trip`() {
        // When
        val secondTrip = jpaERSRepository.findTripBeforeTripNumber(
                "FAK000999999",
                9463714)

        // Then
        assertThat(secondTrip.tripNumber).isEqualTo(9463713)
        assertThat(secondTrip.startDate.toString()).isEqualTo("2019-01-18T11:45Z")
        assertThat(secondTrip.endDate.toString()).isEqualTo("2019-02-23T13:08Z")
    }

    @Test
    @Transactional
    fun `findTripBeforeTripNumber Should return an exception When the current trip number is invalid`() {
        // When
        val throwable = catchThrowable {
            jpaERSRepository.findTripBeforeTripNumber(
                    "FAK000999999",
                    9463712)
        }

        // Then
        assertThat(throwable).isInstanceOf(NoLogbookFishingTripFound::class.java)
        assertThat(throwable.message).contains("No trip found found for the vessel.")
    }

    @Test
    @Transactional
    fun `findTripBeforeTripNumber Should return the previous trip number When there is no overlap between the current and previous trip`() {
        // When
        val secondTrip = jpaERSRepository.findTripBeforeTripNumber(
                "FAK000999999",
                9463715)

        // Then
        assertThat(secondTrip.tripNumber).isEqualTo(9463714)
        assertThat(secondTrip.startDate.toString()).isEqualTo("2019-02-17T01:05Z")
        assertThat(secondTrip.endDate.toString()).isEqualTo("2019-10-15T12:01Z")
    }

    @Test
    @Transactional
    fun `findTripAfterTripNumber Should return the next trip number When there is an overlap between the current and previous trip`() {
        // When
        val secondTrip = jpaERSRepository.findTripAfterTripNumber(
                "FAK000999999",
                9463713)

        // Then
        assertThat(secondTrip.tripNumber).isEqualTo(9463714)
        assertThat(secondTrip.startDate.toString()).isEqualTo("2019-02-17T01:05Z")
        assertThat(secondTrip.endDate.toString()).isEqualTo("2019-10-15T12:01Z")
    }

    @Test
    @Transactional
    fun `findTripAfterTripNumber Should return the next trip number When there is no overlap between the current and previous trip`() {
        // When
        val secondTrip = jpaERSRepository.findTripAfterTripNumber(
                "FAK000999999",
                9463714)

        // Then
        assertThat(secondTrip.tripNumber).isEqualTo(9463715)
        assertThat(secondTrip.startDate.toString()).isEqualTo("2019-10-11T02:06Z")
        assertThat(secondTrip.endDate.toString()).isEqualTo("2019-10-22T11:06Z")
    }

    @Test
    @Transactional
    fun `findTripAfterTripNumber Should throw an exception When there is no next trip found`() {
        // When
        val throwable = catchThrowable {
            jpaERSRepository.findTripAfterTripNumber(
                    "FAK000999999",
                    9463715)
        }

        // Then
        assertThat(throwable).isInstanceOf(NoLogbookFishingTripFound::class.java)
        assertThat(throwable.message).contains("No trip found found for the vessel.")
    }

    @Test
    @Transactional
    fun `findAllMessagesByTripNumberBetweenDates Should retrieve all messages When the CFR is given`() {
        // Given
        val lastDepartureDate = ZonedDateTime.of(2019, 10, 11, 2, 6, 0, 0, UTC)
        val now = ZonedDateTime.now()

        // When
        val messages = jpaERSRepository
                .findAllMessagesByTripNumberBetweenDates("FAK000999999", lastDepartureDate, now, 9463715)

        // Then
        assertThat(messages).hasSize(19)

        // LAN
        assertThat(messages[0].message).isInstanceOf(LAN::class.java)
        val lanMessage = messages[0].message as LAN
        assertThat(lanMessage.port).isEqualTo("AEAJM")
        assertThat(lanMessage.sender).isEqualTo("MAS")
        assertThat(lanMessage.catchLanded).hasSize(6)
        assertThat(lanMessage.landingDateTime).isAfter(ZonedDateTime.now().minusDays(5))

        // RTP
        assertThat(messages[1].message).isInstanceOf(RTP::class.java)
        val rtpMessage = messages[1].message as RTP
        assertThat(rtpMessage.dateTime).isAfter(ZonedDateTime.now().minusDays(5))

        // PNO
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
        assertThat(pnoMessage.tripStartDate.toString()).isEqualTo("2019-10-11T00:00Z[UTC]")
        assertThat(pnoMessage.predictedArrivalDateTime).isAfter(ZonedDateTime.now().minusDays(5))

        // EOF
        assertThat(messages[3].message).isInstanceOf(EOF::class.java)
        val eofMessage = messages[3].message as EOF
        assertThat(eofMessage.endOfFishingDateTime.toString()).isEqualTo("2019-10-20T12:16Z[UTC]")

        // DIS
        assertThat(messages[4].message).isInstanceOf(DIS::class.java)
        val disMessage = messages[4].message as DIS
        assertThat(disMessage.catches).hasSize(2)
        assertThat(disMessage.catches.first().weight).isEqualTo(5.0)
        assertThat(disMessage.catches.first().numberFish).isEqualTo(1.0)
        assertThat(disMessage.catches.first().species).isEqualTo("NEP")

        // INS
        assertThat(messages[5].operationType).isEqualTo(ERSOperationType.DAT)
        assertThat(messages[5].referencedErsId).isNotNull
        assertThat(messages[5].message).isNull()

        // FAR
        assertThat(messages[6].operationType).isEqualTo(ERSOperationType.COR)
        assertThat(messages[6].referencedErsId).isNotNull
        assertThat(messages[6].message).isInstanceOf(FAR::class.java)
        val farMessageOneCorrected = messages[6].message as FAR
        assertThat(farMessageOneCorrected.gear).isEqualTo("GTN")
        assertThat(farMessageOneCorrected.mesh).isEqualTo(150.0)
        assertThat(farMessageOneCorrected.catchDateTime.toString()).isEqualTo("2019-10-17T11:32Z[UTC]")
        assertThat(farMessageOneCorrected.catches).hasSize(20)
        assertThat(farMessageOneCorrected.catches.first().weight).isEqualTo(1500.0)
        assertThat(farMessageOneCorrected.catches.first().numberFish).isEqualTo(null)
        assertThat(farMessageOneCorrected.catches.first().species).isEqualTo("BON")
        assertThat(farMessageOneCorrected.catches.first().faoZone).isEqualTo("27.8.a")
        assertThat(farMessageOneCorrected.catches.first().effortZone).isEqualTo("C")
        assertThat(farMessageOneCorrected.catches.first().economicZone).isEqualTo("FRA")
        assertThat(farMessageOneCorrected.catches.first().statisticalRectangle).isEqualTo("23E6")

        // FAR
        assertThat(messages[7].message).isInstanceOf(FAR::class.java)
        val farMessageOne = messages[7].message as FAR
        assertThat(farMessageOne.gear).isEqualTo("GTN")
        assertThat(farMessageOne.mesh).isEqualTo(100.0)
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

        // CRO
        assertThat(messages[8].messageType).isEqualTo("CRO")
        assertThat(messages[8].message).isInstanceOf(CRO::class.java)

        // COE
        assertThat(messages[9].messageType).isEqualTo("COE")
        assertThat(messages[9].message).isInstanceOf(COE::class.java)

        // COX
        assertThat(messages[10].messageType).isEqualTo("COX")
        assertThat(messages[10].message).isInstanceOf(COX::class.java)

        // DEP
        assertThat(messages[11].message).isInstanceOf(DEP::class.java)
        val depMessage = messages[11].message as DEP
        assertThat(depMessage.gearOnboard).hasSize(2)
        assertThat(depMessage.gearOnboard.first().gear).isEqualTo("GTN")
        assertThat(depMessage.gearOnboard.first().mesh).isEqualTo(100.0)
        assertThat(depMessage.departurePort).isEqualTo("AEJAZ")
        assertThat(depMessage.anticipatedActivity).isEqualTo("FSH")
        assertThat(depMessage.departureDateTime.toString()).isEqualTo("2019-10-11T01:40Z[UTC]")

        // RET
        assertThat(messages[12].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[12].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage1 = messages[12].message as Acknowledge
        assertThat(ackMessage1.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[13].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[13].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage2 = messages[13].message as Acknowledge
        assertThat(ackMessage2.returnStatus).isEqualTo("002")

        // RET
        assertThat(messages[14].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[14].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage3 = messages[14].message as Acknowledge
        assertThat(ackMessage3.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[15].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[15].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage4 = messages[15].message as Acknowledge
        assertThat(ackMessage4.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[16].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[16].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage5 = messages[16].message as Acknowledge
        assertThat(ackMessage5.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[17].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[17].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage6 = messages[17].message as Acknowledge
        assertThat(ackMessage6.returnStatus).isEqualTo("000")

        // DEL
        assertThat(messages[18].operationType).isEqualTo(ERSOperationType.DEL)
        assertThat(messages[18].referencedErsId).isEqualTo("OOF20190627059908")
    }

    @Test
    @Transactional
    fun `findLANAndPNOMessagesNotAnalyzedBy Should not return already analyzed LAN by rule PNO_LAN_WEIGHT_TOLERANCE`() {
        // When
        val messages = jpaERSRepository.findLANAndPNOMessagesNotAnalyzedBy("PNO_LAN_WEIGHT_TOLERANCE")

        // Then
        assertThat(messages).hasSize(2)
    }

    @Test
    @Transactional
    fun `findLANAndPNOMessagesNotAnalyzedBy Should return the corrected LAN and not the previous one`() {
        // Given
        val lanMessageBeingCorrected = "OOF20190430059907"

        // When
        val messages = jpaERSRepository.findLANAndPNOMessagesNotAnalyzedBy("FAKE_RULE_NAME")

        // Then, the origin LAN message is not present (3 messages in place of 4)
        assertThat(messages).hasSize(3)

        assertThat(messages.any {
            it.first.operationType == ERSOperationType.DAT && it.first.ersId == lanMessageBeingCorrected
        }).isFalse
        assertThat(messages.any {
            it.first.operationType == ERSOperationType.COR && it.first.referencedErsId == lanMessageBeingCorrected
        }).isTrue
    }

    @Test
    @Transactional
    fun `findLANAndPNOMessagesNotAnalyzedBy Should return the LAN and the associated PNO`() {
        // When
        val messages = jpaERSRepository.findLANAndPNOMessagesNotAnalyzedBy("PNO_LAN_WEIGHT_TOLERANCE")

        // Then, for the first pair of result
        assertThat(messages.first().first.internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(messages.first().second?.internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(messages.first().first.tripNumber).isEqualTo(9463714)
        assertThat(messages.first().second?.tripNumber).isEqualTo(9463714)
        assertThat(messages.first().first.messageType).isEqualTo(ERSMessageTypeMapping.LAN.name)
        assertThat(messages.first().second?.messageType).isEqualTo(ERSMessageTypeMapping.PNO.name)
    }

    @Test
    @Transactional
    fun `updateERSMessagesAsProcessedByRule Should update multiple message processed by a rule`() {
        // When
        jpaERSRepository.updateERSMessagesAsProcessedByRule(listOf(2, 10), "PNO_LAN_WEIGHT_TOLERANCE")

        // Then
        val firstMessageUpdated = jpaERSRepository.findById(2)
        assertThat(firstMessageUpdated.analyzedByRules).hasSize(1)
        assertThat(firstMessageUpdated.analyzedByRules.first()).isEqualTo("PNO_LAN_WEIGHT_TOLERANCE")

        val secondMessageUpdated = jpaERSRepository.findById(10)
        assertThat(secondMessageUpdated.analyzedByRules).hasSize(1)
        assertThat(secondMessageUpdated.analyzedByRules.first()).isEqualTo("PNO_LAN_WEIGHT_TOLERANCE")
    }

    @Test
    @Transactional
    fun `findLastMessageDate Should find the last message datetime before now and not a datetime in the future`() {
        // When
        val dateTime = jpaERSRepository.findLastMessageDate()

        // Then
        assertThat(dateTime).isEqualTo(ZonedDateTime.parse("2021-01-18T07:19:29.384921Z"))
    }
}
