package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.ers.ERSOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.ers.messages.*
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSLastDepartureDateFound
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

    @Test
    @Transactional
    fun `findLastDepartureDateAndTripNumber Should return the last departure date When the CFR is given`() {
        // When
        val lastDepartureDateAndTripNumber = jpaERSRepository.findLastDepartureDateAndTripNumber("FAK000999999", ZonedDateTime.now())

        // Then
        assertThat(lastDepartureDateAndTripNumber.lastDepartureDate.toString()).isEqualTo("2019-10-11T02:06Z")
        assertThat(lastDepartureDateAndTripNumber.tripNumber).isEqualTo(9463715)
    }

    @Test
    @Transactional
    fun `findLastDepartureDateAndTripNumber Should throw an exception When no parameter is given`() {
        // When
        val throwable = catchThrowable { jpaERSRepository.findLastDepartureDateAndTripNumber("", ZonedDateTime.now()) }

        // Then
        assertThat(throwable).isInstanceOf(NoERSLastDepartureDateFound::class.java)
        assertThat(throwable.message).contains("No departure date (DEP) found for the vessel.")
    }

    @Test
    @Transactional
    fun `findLastDepartureDateAndTripNumber Should throw an exception When the vessel could not be found`() {
        // When
        val throwable = catchThrowable { jpaERSRepository.findLastDepartureDateAndTripNumber("ARGH", ZonedDateTime.now()) }

        // Then
        assertThat(throwable).isInstanceOf(NoERSLastDepartureDateFound::class.java)
        assertThat(throwable.message).contains("No departure date (DEP) found for the vessel.")
    }

    @Test
    @Transactional
    fun `findSecondDepartureDateByInternalReferenceNumber Should return the second departure date When the second DEP is not the last one`() {
        // When
        val secondDepartureDateAndTripNumber = jpaERSRepository.findSecondDepartureDateByInternalReferenceNumber(
                "FAK000999999",
                ZonedDateTime.parse("2019-02-15T01:05:00Z"))

        // Then
        assertThat(secondDepartureDateAndTripNumber.lastDepartureDate.toString()).isEqualTo("2019-02-27T01:05Z")
        assertThat(secondDepartureDateAndTripNumber.tripNumber).isEqualTo(9463714)
    }

    @Test
    @Transactional
    fun `findSecondDepartureDateByInternalReferenceNumber Should return the second departure date When the second DEP is the last DEP`() {
        // When
        val secondDepartureDateAndTripNumber = jpaERSRepository.findSecondDepartureDateByInternalReferenceNumber(
                "FAK000999999",
                ZonedDateTime.parse("2019-02-18T01:05:00Z"))

        // Then
        assertThat(secondDepartureDateAndTripNumber.lastDepartureDate.toString()).isEqualTo("2019-10-11T02:06Z")
        assertThat(secondDepartureDateAndTripNumber.tripNumber).isEqualTo(9463715)
    }

    @Test
    @Transactional
    fun `findSecondDepartureDateByInternalReferenceNumber Should throw an exception When no second DEP is found`() {
        // When
        // When
        val throwable = catchThrowable { jpaERSRepository.findSecondDepartureDateByInternalReferenceNumber("FAK000999999", ZonedDateTime.parse("2019-02-28T01:05:00Z")) }

        // Then
        assertThat(throwable).isInstanceOf(NoERSLastDepartureDateFound::class.java)
        assertThat(throwable.message).contains("No departure date (DEP) found for the vessel.")
    }

    @Test
    @Transactional
    fun `findAllMessagesAfterDepartureDate Should retrieve all messages When the CFR is given`() {
        // Given
        val lastDepartureDate = ZonedDateTime.of(2019, 10, 11, 2, 6, 0, 0, UTC)
        val now = ZonedDateTime.now()

        // When
        val messages = jpaERSRepository
                .findAllMessagesBetweenDepartureDates(lastDepartureDate, now, "FAK000999999")

        // Then
        assertThat(messages).hasSize(20)

        // LAN
        assertThat(messages[0].message).isInstanceOf(LAN::class.java)
        val lanMessage = messages[0].message as LAN
        assertThat(lanMessage.port).isEqualTo("AEAJM")
        assertThat(lanMessage.sender).isEqualTo("MAS")
        assertThat(lanMessage.catchLanded).hasSize(6)
        assertThat(lanMessage.landingDateTime.toString()).isEqualTo("2019-10-22T11:06Z[UTC]")

        // RTP
        assertThat(messages[1].message).isInstanceOf(RTP::class.java)
        val rtpMessage = messages[1].message as RTP
        assertThat(rtpMessage.dateTime).isEqualTo("2019-10-21T11:12:00Z[UTC]")

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
        assertThat(pnoMessage.predictedArrivalDateTime.toString()).isEqualTo("2019-10-21T08:16Z[UTC]")

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

        // FAR
        assertThat(messages[10].message).isInstanceOf(FAR::class.java)
        val farMessageTwo = messages[10].message as FAR
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

        // COX
        assertThat(messages[11].messageType).isEqualTo("COX")
        assertThat(messages[11].message).isInstanceOf(COX::class.java)

        // DEP
        assertThat(messages[12].message).isInstanceOf(DEP::class.java)
        val depMessage = messages[12].message as DEP
        assertThat(depMessage.gearOnboard).hasSize(2)
        assertThat(depMessage.gearOnboard.first().gear).isEqualTo("GTN")
        assertThat(depMessage.gearOnboard.first().mesh).isEqualTo(100.0)
        assertThat(depMessage.departurePort).isEqualTo("AEJAZ")
        assertThat(depMessage.anticipatedActivity).isEqualTo("FSH")
        assertThat(depMessage.departureDateTime.toString()).isEqualTo("2019-10-11T01:40Z[UTC]")

        // RET
        assertThat(messages[13].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[13].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage1 = messages[13].message as Acknowledge
        assertThat(ackMessage1.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[14].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[14].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage2 = messages[14].message as Acknowledge
        assertThat(ackMessage2.returnStatus).isEqualTo("002")

        // RET
        assertThat(messages[15].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[15].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage3 = messages[15].message as Acknowledge
        assertThat(ackMessage3.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[16].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[16].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage4 = messages[16].message as Acknowledge
        assertThat(ackMessage4.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[17].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[17].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage5 = messages[17].message as Acknowledge
        assertThat(ackMessage5.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[18].message).isInstanceOf(Acknowledge::class.java)
        assertThat(messages[18].operationType).isEqualTo(ERSOperationType.RET)
        val ackMessage6 = messages[18].message as Acknowledge
        assertThat(ackMessage6.returnStatus).isEqualTo("000")

        // DEL
        assertThat(messages[19].operationType).isEqualTo(ERSOperationType.DEL)
        assertThat(messages[19].referencedErsId).isEqualTo("OOF20190627059908")
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
