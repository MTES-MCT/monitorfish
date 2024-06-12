package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.MapperConfiguration
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookRawMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTransmissionFormat
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoLogbookFishingTripFound
import fr.gouv.cnsp.monitorfish.domain.use_cases.TestUtils
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LogbookReportEntity
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.catchThrowable
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Import
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime
import java.util.*

@Import(MapperConfiguration::class)
@SpringBootTest(properties = ["monitorfish.scheduling.enable=false"])
class JpaLogbookReportRepositoryITests : AbstractDBTests() {
    @Autowired
    private lateinit var jpaLogbookReportRepository: JpaLogbookReportRepository

    @Autowired
    private lateinit var jpaLogbookRawMessageRepository: JpaLogbookRawMessageRepository

    @Autowired
    private lateinit var jpaRiskFactorRepository: JpaRiskFactorRepository

    @Autowired
    private lateinit var jpaVesselRepository: JpaVesselRepository

    @Autowired
    lateinit var cacheManager: CacheManager

    @BeforeEach
    fun setup() {
        cacheManager.getCache("ers")?.clear()
    }

    @AfterEach
    fun after() {
        jpaLogbookReportRepository.deleteAll()
    }

    /**
     *                               Trips overlap in test data (see V666.5__Insert_logbook.sql)
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
     *                                                                            <- 2019-10-11T01:06Z
     *                                                                            +------------------------+
     *                                                                            | Trip number 15         |
     *                                                                            +------------------------+
     *                                                                                  2019-10-22T11:06Z ->
     */

    @Test
    @Transactional
    fun `findLastTripBefore Should return the last departure date When the CFR is given`() {
        // When
        val lastTrip = jpaLogbookReportRepository.findLastTripBeforeDateTime("FAK000999999", ZonedDateTime.now())

        // Then
        assertThat(lastTrip.startDate.toString()).isEqualTo("2019-10-11T01:06Z")
        assertThat(lastTrip.tripNumber).isEqualTo("9463715")
    }

    @Test
    @Transactional
    fun `findLastTripBefore Should throw an exception When no parameter is given`() {
        // When
        val throwable =
            catchThrowable {
                jpaLogbookReportRepository.findLastTripBeforeDateTime("", ZonedDateTime.now())
            }

        // Then
        assertThat(throwable).isInstanceOf(NoLogbookFishingTripFound::class.java)
        assertThat(throwable.message).contains("No trip found for the vessel.")
    }

    @Test
    @Transactional
    fun `findLastTripBefore Should throw an exception When the vessel could not be found`() {
        // When
        val throwable =
            catchThrowable {
                jpaLogbookReportRepository.findLastTripBeforeDateTime(
                    "ARGH",
                    ZonedDateTime.now(),
                )
            }

        // Then
        assertThat(throwable).isInstanceOf(NoLogbookFishingTripFound::class.java)
        assertThat(throwable.message).contains("No trip found for the vessel.")
    }

    @Test
    @Transactional
    fun `findTripBeforeTripNumber Should return the previous trip number When there is an overlap between the current and previous trip`() {
        // When
        val secondTrip =
            jpaLogbookReportRepository.findTripBeforeTripNumber(
                "FAK000999999",
                "9463714",
            )

        // Then
        assertThat(secondTrip.tripNumber).isEqualTo("9463713")
        assertThat(secondTrip.startDate.toString()).isEqualTo("2019-01-18T11:45Z")
        assertThat(secondTrip.endDate.toString()).isEqualTo("2019-02-23T13:08Z")
    }

    @Test
    @Transactional
    fun `findTripBeforeTripNumber Should return an exception When the current trip number is invalid`() {
        // When
        val throwable =
            catchThrowable {
                jpaLogbookReportRepository.findTripBeforeTripNumber(
                    "FAK000999999",
                    "9463712",
                )
            }

        // Then
        assertThat(throwable).isInstanceOf(NoLogbookFishingTripFound::class.java)
        assertThat(throwable.message).contains("No trip found for the vessel.")
    }

    @Test
    @Transactional
    fun `findTripBeforeTripNumber Should return the previous trip number When there is no overlap between the current and previous trip`() {
        // When
        val secondTrip =
            jpaLogbookReportRepository.findTripBeforeTripNumber(
                "FAK000999999",
                "9463715",
            )

        // Then
        assertThat(secondTrip.tripNumber).isEqualTo("9463714")
        assertThat(secondTrip.startDate.toString()).isEqualTo("2019-02-17T01:05Z")
        assertThat(secondTrip.endDate.toString()).isEqualTo("2019-10-15T12:01Z")
    }

    @Test
    @Transactional
    fun `findTripAfterTripNumber Should return the next trip number When there is an overlap between the current and previous trip`() {
        // When
        val secondTrip =
            jpaLogbookReportRepository.findTripAfterTripNumber(
                "FAK000999999",
                "9463713",
            )

        // Then
        assertThat(secondTrip.tripNumber).isEqualTo("9463714")
        assertThat(secondTrip.startDate.toString()).isEqualTo("2019-02-17T01:05Z")
        assertThat(secondTrip.endDate.toString()).isEqualTo("2019-10-15T12:01Z")
    }

    @Test
    @Transactional
    fun `findTripAfterTripNumber Should return the next trip number When there is no overlap between the current and previous trip`() {
        // When
        val secondTrip =
            jpaLogbookReportRepository.findTripAfterTripNumber(
                "FAK000999999",
                "9463714",
            )

        // Then
        assertThat(secondTrip.tripNumber).isEqualTo("9463715")
        assertThat(secondTrip.startDate.toString()).isEqualTo("2019-10-11T01:06Z")
        assertThat(secondTrip.endDate.toString()).isEqualTo("2019-10-22T11:06Z")
    }

    @Test
    @Transactional
    fun `findTripAfterTripNumber Should throw an exception When there is no next trip found`() {
        // When
        val throwable =
            catchThrowable {
                jpaLogbookReportRepository.findTripAfterTripNumber(
                    "FAK000999999",
                    "9463715",
                )
            }

        // Then
        assertThat(throwable).isInstanceOf(NoLogbookFishingTripFound::class.java)
        assertThat(throwable.message).contains("No trip found for the vessel.")
    }

    @Test
    @Transactional
    fun `findAllMessagesByTripNumberBetweenDates Should retrieve all messages When the CFR is given`() {
        // Given
        val lastDepartureDate = ZonedDateTime.of(2019, 10, 11, 0, 4, 0, 0, UTC)
        val now = ZonedDateTime.now()

        // When
        val messages =
            jpaLogbookReportRepository
                .findAllMessagesByTripNumberBetweenDates("FAK000999999", lastDepartureDate, now, "9463715")

        // Then
        assertThat(messages).hasSize(20)

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
        assertThat(pnoMessage.catchToLand).hasSize(4)
        assertThat(pnoMessage.catchToLand.first().weight).isEqualTo(15.0)
        assertThat(pnoMessage.catchToLand.first().numberFish).isEqualTo(null)
        assertThat(pnoMessage.catchToLand.first().species).isEqualTo("SLS")
        assertThat(pnoMessage.catchToLand.first().faoZone).isEqualTo("27.8.a")
        assertThat(pnoMessage.catchToLand.first().effortZone).isEqualTo("C")
        assertThat(pnoMessage.catchToLand.first().economicZone).isEqualTo("FRA")
        assertThat(pnoMessage.catchToLand.first().statisticalRectangle).isEqualTo("23E6")
        assertThat(pnoMessage.tripStartDate).isAfter(ZonedDateTime.now().minusDays(5))
        assertThat(pnoMessage.predictedArrivalDatetimeUtc).isAfter(ZonedDateTime.now().minusDays(5))

        // EOF
        assertThat(messages[3].message).isInstanceOf(EOF::class.java)
        val eofMessage = messages[3].message as EOF
        assertThat(eofMessage.endOfFishingDateTime.toString()).isEqualTo("2019-10-20T12:16Z")

        // DIS
        assertThat(messages[4].message).isInstanceOf(DIS::class.java)
        val disMessage = messages[4].message as DIS
        assertThat(disMessage.catches).hasSize(2)
        assertThat(disMessage.catches.first().weight).isEqualTo(5.0)
        assertThat(disMessage.catches.first().numberFish).isEqualTo(1.0)
        assertThat(disMessage.catches.first().species).isEqualTo("NEP")

        // INS
        assertThat(messages[5].operationType).isEqualTo(LogbookOperationType.COR)
        assertThat(messages[5].referencedReportId).isNotNull
        assertThat(messages[5].message).isNull()

        // FAR
        assertThat(messages[6].operationType).isEqualTo(LogbookOperationType.COR)
        assertThat(messages[6].referencedReportId).isNotNull
        assertThat(messages[6].message).isInstanceOf(FAR::class.java)
        val farMessageOneCorrected = messages[6].message as FAR
        assertThat(farMessageOneCorrected.hauls.size).isEqualTo(1)
        val farMessageOneCorrectedHaul = farMessageOneCorrected.hauls.first()
        assertThat(farMessageOneCorrectedHaul.gear).isEqualTo("GTN")
        assertThat(farMessageOneCorrectedHaul.mesh).isEqualTo(150.0)
        assertThat(farMessageOneCorrectedHaul.dimensions).isEqualTo("120.0")

        assertThat(farMessageOneCorrectedHaul.catches).hasSize(20)
        assertThat(farMessageOneCorrectedHaul.catches.first().weight).isEqualTo(1500.0)
        assertThat(farMessageOneCorrectedHaul.catches.first().numberFish).isEqualTo(null)
        assertThat(farMessageOneCorrectedHaul.catches.first().species).isEqualTo("BON")
        assertThat(farMessageOneCorrectedHaul.catches.first().faoZone).isEqualTo("27.8.a")
        assertThat(farMessageOneCorrectedHaul.catches.first().effortZone).isEqualTo("C")
        assertThat(farMessageOneCorrectedHaul.catches.first().economicZone).isEqualTo("FRA")
        assertThat(farMessageOneCorrectedHaul.catches.first().statisticalRectangle).isEqualTo("23E6")

        // FAR
        assertThat(messages[7].message).isInstanceOf(FAR::class.java)
        val farMessageOne = messages[7].message as FAR
        assertThat(farMessageOne.hauls.size).isEqualTo(1)
        val farMessageOneHaul = farMessageOne.hauls.first()
        assertThat(farMessageOneHaul.gear).isEqualTo("GTN")
        assertThat(farMessageOneHaul.mesh).isEqualTo(100.0)
        assertThat(farMessageOneHaul.dimensions).isEqualTo("150.0;120.0")

        assertThat(farMessageOneHaul.catchDateTime.toString()).isEqualTo("2019-10-17T11:32Z")
        assertThat(farMessageOneHaul.catches).hasSize(4)
        assertThat(farMessageOneHaul.catches.first().weight).isEqualTo(1500.0)
        assertThat(farMessageOneHaul.catches.first().numberFish).isEqualTo(null)
        assertThat(farMessageOneHaul.catches.first().species).isEqualTo("BON")
        assertThat(farMessageOneHaul.catches.first().faoZone).isEqualTo("27.8.a")
        assertThat(farMessageOneHaul.catches.first().effortZone).isEqualTo("C")
        assertThat(farMessageOneHaul.catches.first().economicZone).isEqualTo("FRA")
        assertThat(farMessageOneHaul.catches.first().statisticalRectangle).isEqualTo("23E6")

        // CRO
        assertThat(messages[8].messageType).isEqualTo("CRO")
        assertThat(messages[8].message).isInstanceOf(CRO::class.java)

        // COE
        assertThat(messages[9].reportDateTime.toString()).isEqualTo("2019-10-17T01:32Z")
        assertThat(messages[9].messageType).isEqualTo("COE")
        assertThat(messages[9].message).isInstanceOf(COE::class.java)

        // COX
        assertThat(messages[10].reportDateTime.toString()).isEqualTo("2019-10-15T11:23Z")
        assertThat(messages[10].messageType).isEqualTo("COX")
        assertThat(messages[10].message).isInstanceOf(COX::class.java)

        // DEP
        assertThat(messages[11].reportDateTime.toString()).isEqualTo("2019-10-11T02:06Z")
        assertThat(messages[11].message).isInstanceOf(DEP::class.java)
        val depMessage = messages[11].message as DEP
        assertThat(depMessage.gearOnboard).hasSize(2)
        assertThat(depMessage.gearOnboard.first().gear).isEqualTo("GTN")
        assertThat(depMessage.gearOnboard.first().mesh).isEqualTo(100.0)
        assertThat(depMessage.departurePort).isEqualTo("AEJAZ")
        assertThat(depMessage.anticipatedActivity).isEqualTo("FSH")
        assertThat(depMessage.departureDateTime.toString()).isEqualTo("2019-10-11T01:40Z")

        // CPS
        assertThat(messages[12].reportDateTime.toString()).isEqualTo("2019-10-11T01:06Z")
        assertThat(messages[12].message).isInstanceOf(CPS::class.java)
        val cpsMessage = messages[12].message as CPS
        assertThat(cpsMessage.gear).isEqualTo("GTR")
        assertThat(cpsMessage.cpsDatetime.toString()).isEqualTo("2023-02-28T17:44Z")

        // RET
        assertThat(messages[13].reportDateTime.toString()).isEqualTo("2021-01-18T07:19:29.384921Z")
        assertThat(messages[13].message).isInstanceOf(Acknowledgment::class.java)
        assertThat(messages[13].operationType).isEqualTo(LogbookOperationType.RET)
        val ackMessage1 = messages[13].message as Acknowledgment
        assertThat(ackMessage1.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[14].reportDateTime.toString()).isEqualTo("2019-08-30T11:12Z")
        assertThat(messages[14].message).isInstanceOf(Acknowledgment::class.java)
        assertThat(messages[14].operationType).isEqualTo(LogbookOperationType.RET)
        val ackMessage2 = messages[14].message as Acknowledgment
        assertThat(ackMessage2.returnStatus).isEqualTo("002")

        // RET
        assertThat(messages[15].message).isInstanceOf(Acknowledgment::class.java)
        assertThat(messages[15].operationType).isEqualTo(LogbookOperationType.RET)
        val ackMessage3 = messages[15].message as Acknowledgment
        assertThat(ackMessage3.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[16].message).isInstanceOf(Acknowledgment::class.java)
        assertThat(messages[16].operationType).isEqualTo(LogbookOperationType.RET)
        val ackMessage4 = messages[16].message as Acknowledgment
        assertThat(ackMessage4.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[17].message).isInstanceOf(Acknowledgment::class.java)
        assertThat(messages[17].operationType).isEqualTo(LogbookOperationType.RET)
        val ackMessage5 = messages[17].message as Acknowledgment
        assertThat(ackMessage5.returnStatus).isEqualTo("000")

        // DEL
        assertThat(messages[18].reportDateTime.toString()).isEqualTo("2019-10-30T11:32Z")
        assertThat(messages[18].operationType).isEqualTo(LogbookOperationType.RET)
        assertThat(messages[18].message).isInstanceOf(Acknowledgment::class.java)
        val ackMessage6 = messages[18].message as Acknowledgment
        assertThat(ackMessage6.returnStatus).isEqualTo("000")

        // RET
        assertThat(messages[19].reportDateTime.toString()).isEqualTo("2019-10-30T11:32Z")
        assertThat(messages[19].operationType).isEqualTo(LogbookOperationType.DEL)
        assertThat(messages[19].referencedReportId).isEqualTo("OOF20190627059908")
    }

    @Test
    @Transactional
    fun `findAllMessagesByTripNumberBetweenDates Should retrieve messages around the date time`() {
        // Given
        val afterDate = ZonedDateTime.of(2019, 10, 11, 1, 4, 0, 0, UTC)
        val beforeDate = ZonedDateTime.of(2019, 10, 11, 9, 4, 0, 0, UTC)

        // When
        val messages =
            jpaLogbookReportRepository
                .findAllMessagesByTripNumberBetweenDates("FAK000999999", afterDate, beforeDate, "9463715")

        // Then
        assertThat(messages).hasSize(2)

        // DEP
        assertThat(messages[0].reportDateTime.toString()).isEqualTo("2019-10-11T02:06Z")
        assertThat(messages[0].message).isInstanceOf(DEP::class.java)
        val depMessage = messages[0].message as DEP
        assertThat(depMessage.gearOnboard).hasSize(2)
        assertThat(depMessage.gearOnboard.first().gear).isEqualTo("GTN")
        assertThat(depMessage.gearOnboard.first().mesh).isEqualTo(100.0)
        assertThat(depMessage.departurePort).isEqualTo("AEJAZ")
        assertThat(depMessage.anticipatedActivity).isEqualTo("FSH")
        assertThat(depMessage.departureDateTime.toString()).isEqualTo("2019-10-11T01:40Z")
    }

    @Test
    @Transactional
    fun `findLANAndPNOMessagesNotAnalyzedBy Should not return already analyzed LAN by rule PNO_LAN_WEIGHT_TOLERANCE`() {
        // When
        val messages = jpaLogbookReportRepository.findLANAndPNOMessagesNotAnalyzedBy("PNO_LAN_WEIGHT_TOLERANCE")

        // Then
        assertThat(messages).hasSize(2)
    }

    @Test
    @Transactional
    fun `findLANAndPNOMessagesNotAnalyzedBy Should return the corrected LAN and not the previous one`() {
        // Given
        val lanMessageBeingCorrected = "OOF20190430059907"

        // When
        val messages = jpaLogbookReportRepository.findLANAndPNOMessagesNotAnalyzedBy("FAKE_RULE_NAME")

        // Then, the origin LAN message is not present (3 messages in place of 4)
        assertThat(messages).hasSize(3)

        assertThat(
            messages.any {
                it.first.operationType == LogbookOperationType.DAT && it.first.reportId == lanMessageBeingCorrected
            },
        ).isFalse
        assertThat(
            messages.any {
                it.first.operationType == LogbookOperationType.COR && it.first.referencedReportId == lanMessageBeingCorrected
            },
        ).isTrue
    }

    @Test
    @Transactional
    fun `findLANAndPNOMessagesNotAnalyzedBy Should return the LAN and the associated PNO`() {
        // When
        val messages = jpaLogbookReportRepository.findLANAndPNOMessagesNotAnalyzedBy("PNO_LAN_WEIGHT_TOLERANCE")

        // Then, for the first pair of result
        assertThat(messages.first().first.internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(messages.first().second?.internalReferenceNumber).isEqualTo("FAK000999999")
        assertThat(messages.first().first.tripNumber).isEqualTo("9463714")
        assertThat(messages.first().second?.tripNumber).isEqualTo("9463714")
        assertThat(messages.first().first.messageType).isEqualTo(LogbookMessageTypeMapping.LAN.name)
        assertThat(messages.first().second?.messageType).isEqualTo(LogbookMessageTypeMapping.PNO.name)
    }

    @Test
    @Transactional
    fun `updateERSMessagesAsProcessedByRule Should update multiple message processed by a rule`() {
        // When
        jpaLogbookReportRepository.updateLogbookMessagesAsProcessedByRule(listOf(2, 10), "PNO_LAN_WEIGHT_TOLERANCE")

        // Then
        val firstMessageUpdated = jpaLogbookReportRepository.findById(2)
        assertThat(firstMessageUpdated.analyzedByRules).hasSize(1)
        assertThat(firstMessageUpdated.analyzedByRules.first()).isEqualTo("PNO_LAN_WEIGHT_TOLERANCE")

        val secondMessageUpdated = jpaLogbookReportRepository.findById(10)
        assertThat(secondMessageUpdated.analyzedByRules).hasSize(1)
        assertThat(secondMessageUpdated.analyzedByRules.first()).isEqualTo("PNO_LAN_WEIGHT_TOLERANCE")
    }

    @Test
    @Transactional
    fun `findLastMessageDate Should find the last message datetime before now and not a datetime in the future`() {
        // When
        val dateTime = jpaLogbookReportRepository.findLastMessageDate()

        // Then
        // Because `CURRENT_DATE - INTERVAL '2 days'` is used in the test data
        assertThat(dateTime).isAfter(ZonedDateTime.now().minusDays(3))
    }

    @Test
    @Transactional
    fun `findFirstAcknowledgedDateOfTripBeforeDateTime Should return the last acknowledged message date When transmission format is ERS`() {
        // When
        val lastTrip =
            jpaLogbookReportRepository.findFirstAcknowledgedDateOfTripBeforeDateTime(
                "FAK000999999",
                ZonedDateTime.now(),
            )

        // Then
        assertThat(lastTrip.toString()).isEqualTo("2019-10-17T11:32Z")
    }

    @Test
    @Transactional
    fun `findFirstAcknowledgedDateOfTripBeforeDateTime Should return the last acknowledged message date When transmission format is FLUX`() {
        // When
        val lastTrip =
            jpaLogbookReportRepository.findFirstAcknowledgedDateOfTripBeforeDateTime(
                "SOCR4T3",
                ZonedDateTime.now(),
            )

        // Then
        assertThat(lastTrip.toString()).isEqualTo("2020-05-06T18:39:33Z")
    }

    @Test
    @Transactional
    fun `findFirstAcknowledgedDateOfTripBeforeDateTime Should throw a custom exception When the findFirstAcknowledgedDateOfTrip request is empty`() {
        // When
        val throwable =
            catchThrowable {
                jpaLogbookReportRepository.findFirstAcknowledgedDateOfTripBeforeDateTime(
                    "UNKNOWN_VESS",
                    ZonedDateTime.parse("2018-02-17T01:06:00Z"),
                )
            }

        // Then
        assertThat(throwable).isInstanceOf(NoLogbookFishingTripFound::class.java)
        assertThat(throwable.message).contains("No trip found for the vessel.")
    }

    @Test
    @Transactional
    fun `findLastTwoYearsTripNumbers Should return an empty list When no trip is found`() {
        // When
        val trips =
            jpaLogbookReportRepository.findLastTwoYearsTripNumbers(
                "UNKNOWN_VESS",
            )

        // Then
        assertThat(trips).isEmpty()
    }

    @Test
    @Transactional
    fun `findLastTwoYearsTripNumbers Should return the last trips`() {
        // Given
        val rawMessages =
            listOf(
                LogbookRawMessage("FPXE1546546114565"),
                LogbookRawMessage("FPXE1546545654481"),
            )
        jpaLogbookRawMessageRepository.save(rawMessages.first())
        jpaLogbookRawMessageRepository.save(rawMessages.last())

        val messages = TestUtils.getDummyLogbookMessages()
        jpaLogbookReportRepository.save(
            messages.first()
                .copy(
                    internalReferenceNumber = "FAK000999999",
                    operationNumber = "FPXE1546546114565",
                    reportDateTime = ZonedDateTime.now(),
                    operationDateTime = ZonedDateTime.now(),
                    tripNumber = "123",
                ),
        )
        jpaLogbookReportRepository.save(
            messages.last()
                .copy(
                    internalReferenceNumber = "FAK000999999",
                    operationNumber = "FPXE1546545654481",
                    reportDateTime = ZonedDateTime.now().plusMinutes(3),
                    operationDateTime = ZonedDateTime.now().plusMinutes(3),
                    tripNumber = "456",
                ),
        )

        // When
        val trips =
            jpaLogbookReportRepository.findLastTwoYearsTripNumbers(
                "FAK000999999",
            )

        // Then
        assertThat(trips).isEqualTo(listOf("456", "123"))
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports from ESP & FRA vessels`() {
        // Given
        val filter = PriorNotificationsFilter(
            flagStates = listOf("ESP", "FRA"),
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val result = jpaLogbookReportRepository.findAllPriorNotifications(filter)

        // Then
        assertThat(result).hasSizeGreaterThan(0)
        val resultVessels = result.mapNotNull {
            jpaVesselRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageTyped.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(resultVessels).hasSize(result.size)
        assertThat(resultVessels.all { listOf(CountryCode.ES, CountryCode.FR).contains(it.flagState) }).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports with or without reportings`() {
        val expectedLogbookReportIdsWithOneOrMoreReportings = listOf(102L, 104L)

        // Given
        val firstFilter = PriorNotificationsFilter(
            hasOneOrMoreReportings = true,
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val firstResult = jpaLogbookReportRepository.findAllPriorNotifications(firstFilter)

        // Then
        assertThat(firstResult).hasSizeGreaterThan(0)
        assertThat(
            firstResult.all {
                it.logbookMessageTyped.logbookMessage.id in expectedLogbookReportIdsWithOneOrMoreReportings
            },
        ).isTrue()

        // Given
        val secondFilter = PriorNotificationsFilter(
            hasOneOrMoreReportings = false,
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val secondResult = jpaLogbookReportRepository.findAllPriorNotifications(secondFilter)

        // Then
        assertThat(secondResult).hasSizeGreaterThan(0)
        assertThat(
            secondResult.none {
                it.logbookMessageTyped.logbookMessage.id in expectedLogbookReportIdsWithOneOrMoreReportings
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports for less or more than 12 meters long vessels`() {
        // Given
        val firstFilter = PriorNotificationsFilter(
            isLessThanTwelveMetersVessel = true,
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val firstResult = jpaLogbookReportRepository.findAllPriorNotifications(firstFilter)

        // Then
        assertThat(firstResult).hasSizeGreaterThan(0)
        val firstResultVessels = firstResult.mapNotNull {
            jpaVesselRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageTyped.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(firstResultVessels).hasSize(firstResult.size)
        assertThat(firstResultVessels.all { it.length!! < 12 }).isTrue()

        // Given
        val secondFilter = PriorNotificationsFilter(
            isLessThanTwelveMetersVessel = false,
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val secondResult = jpaLogbookReportRepository.findAllPriorNotifications(secondFilter)

        // Then
        assertThat(secondResult).hasSizeGreaterThan(0)
        val secondResultVessels = secondResult.mapNotNull {
            jpaVesselRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageTyped.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(secondResultVessels).hasSize(secondResult.size)
        assertThat(secondResultVessels.all { it.length!! >= 12 }).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports for vessels controlled after or before January 1st, 2024`() {
        // Given
        val firstFilter = PriorNotificationsFilter(
            lastControlledAfter = "2024-01-01T00:00:00Z",
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val firstResult = jpaLogbookReportRepository.findAllPriorNotifications(firstFilter)

        // Then
        assertThat(firstResult).hasSizeGreaterThan(0)
        val firstResultRiskFactors = firstResult.mapNotNull {
            jpaRiskFactorRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageTyped.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(firstResultRiskFactors).hasSize(firstResult.size)
        assertThat(
            firstResultRiskFactors.all {
                it.lastControlDatetime!!.isAfter(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()

        // Given
        val secondFilter = PriorNotificationsFilter(
            lastControlledBefore = "2024-01-01T00:00:00Z",
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val secondResult = jpaLogbookReportRepository.findAllPriorNotifications(secondFilter)

        // Then
        assertThat(secondResult).hasSizeGreaterThan(0)
        val secondResultRiskFactors = secondResult.mapNotNull {
            jpaRiskFactorRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageTyped.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(secondResultRiskFactors).hasSize(secondResult.size)
        assertThat(
            secondResultRiskFactors.all {
                it.lastControlDatetime!!.isBefore(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports for FRSML & FRVNE ports`() {
        // Given
        val filter = PriorNotificationsFilter(
            portLocodes = listOf("FRSML", "FRVNE"),
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val result = jpaLogbookReportRepository.findAllPriorNotifications(filter)

        // Then
        assertThat(result).hasSizeGreaterThan(0)
        assertThat(
            result.all {
                listOf("FRSML", "FRVNE").contains(it.logbookMessageTyped.typedMessage.port)
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports for PHENOMENE vessel`() {
        // Given
        val firstFilter = PriorNotificationsFilter(
            searchQuery = "pheno",
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val firstResult = jpaLogbookReportRepository.findAllPriorNotifications(firstFilter)

        // Then
        assertThat(firstResult).hasSizeGreaterThan(0)
        val firstResultVessels = firstResult.mapNotNull {
            jpaVesselRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageTyped.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(firstResultVessels).hasSize(firstResult.size)
        assertThat(firstResultVessels.all { it.vesselName == "PHENOMENE" }).isTrue()

        // Given
        val secondFilter = PriorNotificationsFilter(
            searchQuery = "hénO",
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val secondResult = jpaLogbookReportRepository.findAllPriorNotifications(secondFilter)

        // Then
        assertThat(secondResult).hasSizeGreaterThan(0)
        val secondResultVessels = secondResult.mapNotNull {
            jpaVesselRepository.findFirstByInternalReferenceNumber(
                it.logbookMessageTyped.logbookMessage.internalReferenceNumber!!,
            )
        }
        assertThat(secondResultVessels).hasSize(secondResult.size)
        assertThat(secondResultVessels.all { it.vesselName == "PHENOMENE" }).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports for COD & HKE species`() {
        // Given
        val filter = PriorNotificationsFilter(
            specyCodes = listOf("COD", "HKE"),
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val result = jpaLogbookReportRepository.findAllPriorNotifications(filter)

        // Then
        assertThat(result).hasSizeGreaterThan(0)
        assertThat(
            result.all {
                it.logbookMessageTyped.typedMessage.catchOnboard
                    .any { catch -> listOf("COD", "HKE").contains(catch.species) }
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports for Préavis type A & Préavis type C types`() {
        // Given
        val filter = PriorNotificationsFilter(
            priorNotificationTypes = listOf("Préavis type A", "Préavis type C"),
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val result = jpaLogbookReportRepository.findAllPriorNotifications(filter)

        // Then
        assertThat(result).hasSizeGreaterThan(0)
        assertThat(
            result.all {
                it.logbookMessageTyped.typedMessage.pnoTypes
                    .any { type -> listOf("Préavis type A", "Préavis type C").contains(type.name) }
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports for SWW06 & NWW03 segments`() {
        // Given
        val filter = PriorNotificationsFilter(
            tripSegmentCodes = listOf("SWW06", "NWW03"),
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val result = jpaLogbookReportRepository.findAllPriorNotifications(filter)

        // Then
        assertThat(result).hasSizeGreaterThan(0)
        assertThat(
            result.all {
                it.logbookMessageTyped.logbookMessage.tripSegments!!
                    .any { tripSegment ->
                        listOf("SWW06", "NWW03").contains(
                            tripSegment.code,
                        )
                    }
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports for OTT & TB gears`() {
        // Given
        val filter = PriorNotificationsFilter(
            tripGearCodes = listOf("OTT", "TB"),
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val result = jpaLogbookReportRepository.findAllPriorNotifications(filter)

        // Then
        assertThat(result).hasSizeGreaterThan(0)
        assertThat(
            result.all {
                it.logbookMessageTyped.logbookMessage.tripGears!!
                    .any { tripGear -> listOf("OTT", "TB").contains(tripGear.gear) }
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return PNO logbook reports for vessels arriving after or before January 1st, 2024`() {
        // Given
        val firstFilter = PriorNotificationsFilter(
            willArriveAfter = "2024-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val firstResult = jpaLogbookReportRepository.findAllPriorNotifications(firstFilter)

        // Then
        assertThat(firstResult).hasSizeGreaterThan(0)
        assertThat(
            firstResult.all {
                it.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc!!
                    .isAfter(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()

        // Given
        val secondFilter = PriorNotificationsFilter(
            willArriveAfter = "2000-01-01T00:00:00Z",
            willArriveBefore = "2024-01-01T00:00:00Z",
        )

        // When
        val secondResult = jpaLogbookReportRepository.findAllPriorNotifications(secondFilter)

        // Then
        assertThat(secondResult).hasSizeGreaterThan(0)
        assertThat(
            secondResult.all {
                it.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc!!
                    .isBefore(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findAllPriorNotifications Should return the expected PNO logbook reports with multiple filters`() {
        // Given
        val filter = PriorNotificationsFilter(
            priorNotificationTypes = listOf("Préavis type A", "Préavis type C"),
            tripGearCodes = listOf("OTT", "TB"),
            willArriveAfter = "2024-01-01T00:00:00Z",
            willArriveBefore = "2100-01-01T00:00:00Z",
        )

        // When
        val result = jpaLogbookReportRepository.findAllPriorNotifications(filter)

        // Then
        assertThat(result).hasSizeGreaterThan(0)
        assertThat(
            result.all {
                it.logbookMessageTyped.typedMessage.pnoTypes
                    .any { type -> listOf("Préavis type A", "Préavis type C").contains(type.name) }
            },
        ).isTrue()
        assertThat(
            result.all {
                it.logbookMessageTyped.logbookMessage.tripGears!!
                    .any { tripGear -> listOf("OTT", "TB").contains(tripGear.gear) }
            },
        ).isTrue()
        assertThat(
            result.all {
                it.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc!!
                    .isAfter(ZonedDateTime.parse("2024-01-01T00:00:00Z"))
            },
        ).isTrue()
    }

    @Test
    @Transactional
    fun `findById Should return the expected PNO logbook report`() {
        // Given
        val id = 101L

        // When
        val result = jpaLogbookReportRepository.findById(id)

        // Then
        assertThat(result.id).isEqualTo(101)
        assertThat(result.messageType).isEqualTo("PNO")
    }

    @Test
    @Transactional
    fun `mapToReferenceWithRelatedModels should correctly map models`() {
        // Given

        val firstLogbookReportGroupDatOperation = getFakeLogbookReportModel(LogbookOperationType.DAT)
        val firstLogbookReportGroup = listOf(
            firstLogbookReportGroupDatOperation,
        )

        val secondLogbookReportGroupDatOperation = getFakeLogbookReportModel(LogbookOperationType.DAT)
        val secondLogbookReportGroup = listOf(
            secondLogbookReportGroupDatOperation,
            getFakeLogbookReportModel(LogbookOperationType.RET, secondLogbookReportGroupDatOperation.reportId),
        )

        val thirdLogbookReportGroupDatOperation = getFakeLogbookReportModel(LogbookOperationType.DAT)
        val thirdLogbookReportGroupCorOperation = getFakeLogbookReportModel(
            LogbookOperationType.COR,
            thirdLogbookReportGroupDatOperation.reportId,
        )
        val thirdLogbookReportGroup = listOf(
            thirdLogbookReportGroupDatOperation,
            getFakeLogbookReportModel(LogbookOperationType.RET, thirdLogbookReportGroupDatOperation.reportId),
            thirdLogbookReportGroupCorOperation,
            getFakeLogbookReportModel(LogbookOperationType.RET, thirdLogbookReportGroupCorOperation.reportId),
            getFakeLogbookReportModel(LogbookOperationType.DEL, thirdLogbookReportGroupDatOperation.reportId),
        )

        val fourthLogbookReportGroupDatOperation = getFakeLogbookReportModel(LogbookOperationType.COR)
        val fourthLogbookReportGroup = listOf(
            fourthLogbookReportGroupDatOperation,
            getFakeLogbookReportModel(LogbookOperationType.RET, fourthLogbookReportGroupDatOperation.reportId),
        )

        val fifthLogbookReportGroupDatOperation = getFakeLogbookReportModel(
            LogbookOperationType.COR,
            "NONEXISTENT_REPORT_ID",
        )
        val fifthLogbookReportGroup = listOf(
            fifthLogbookReportGroupDatOperation,
            getFakeLogbookReportModel(LogbookOperationType.RET, fifthLogbookReportGroupDatOperation.reportId),
        )

        val logbookReportModels = listOf(
            firstLogbookReportGroup,
            secondLogbookReportGroup,
            thirdLogbookReportGroup,
            fourthLogbookReportGroup,
            fifthLogbookReportGroup,
        ).flatten()

        // When
        val result = JpaLogbookReportRepository.mapToReferenceWithRelatedModels(logbookReportModels)

        // Then

        assertThat(result).hasSize(5)

        val (firstReferenceLogbookReportModel, firstRelatedLogbookReportModels) = result[0]
        assertThat(firstReferenceLogbookReportModel.reportId).isEqualTo(firstLogbookReportGroupDatOperation.reportId)
        assertThat(firstReferenceLogbookReportModel.operationType).isEqualTo(LogbookOperationType.DAT)
        assertThat(firstRelatedLogbookReportModels).isEmpty()

        val (secondReferenceLogbookReportModel, secondRelatedLogbookReportModels) = result[1]
        assertThat(secondReferenceLogbookReportModel.reportId).isEqualTo(secondLogbookReportGroupDatOperation.reportId)
        assertThat(secondReferenceLogbookReportModel.operationType).isEqualTo(LogbookOperationType.DAT)
        assertThat(secondRelatedLogbookReportModels).hasSize(1)
        assertThat(secondRelatedLogbookReportModels.count { it.operationType == LogbookOperationType.RET }).isEqualTo(1)

        val (thirdReferenceLogbookReportModel, thirdRelatedLogbookReportModels) = result[2]
        assertThat(thirdReferenceLogbookReportModel.reportId).isEqualTo(thirdLogbookReportGroupDatOperation.reportId)
        assertThat(thirdReferenceLogbookReportModel.operationType).isEqualTo(LogbookOperationType.DAT)
        assertThat(thirdRelatedLogbookReportModels).hasSize(4)
        assertThat(thirdRelatedLogbookReportModels.count { it.operationType == LogbookOperationType.COR }).isEqualTo(1)
        assertThat(thirdRelatedLogbookReportModels.count { it.operationType == LogbookOperationType.DEL }).isEqualTo(1)
        assertThat(thirdRelatedLogbookReportModels.count { it.operationType == LogbookOperationType.RET }).isEqualTo(2)

        val (fourthReferenceLogbookReportModel, fourthRelatedLogbookReportModels) = result[3]
        assertThat(fourthReferenceLogbookReportModel.reportId).isEqualTo(fourthLogbookReportGroupDatOperation.reportId)
        assertThat(fourthReferenceLogbookReportModel.operationType).isEqualTo(LogbookOperationType.COR)
        assertThat(fourthRelatedLogbookReportModels).hasSize(1)
        assertThat(fourthRelatedLogbookReportModels.count { it.operationType == LogbookOperationType.RET }).isEqualTo(1)

        val (fifthReferenceLogbookReportModel, fifthRelatedLogbookReportModels) = result[4]
        assertThat(fifthReferenceLogbookReportModel.reportId).isEqualTo(fifthLogbookReportGroupDatOperation.reportId)
        assertThat(fifthReferenceLogbookReportModel.operationType).isEqualTo(LogbookOperationType.COR)
        assertThat(fifthRelatedLogbookReportModels).hasSize(1)
        assertThat(fifthRelatedLogbookReportModels.count { it.operationType == LogbookOperationType.RET }).isEqualTo(1)
    }

    @Test
    @Transactional
    fun `findLastReportSoftware Should return the software of the last message`() {
        // When
        val software = jpaLogbookReportRepository.findLastReportSoftware("U_W0NTFINDME")

        // Then
        assertThat(software).isEqualTo("TurboCatch (3.7-1)")
    }

    @Test
    @Transactional
    fun `findLastReportSoftware Should return null if no message found`() {
        // When
        val software = jpaLogbookReportRepository.findLastReportSoftware("UNKNOWN_CFR")

        // Then
        assertThat(software).isNull()
    }

    companion object {
        private fun getFakeLogbookReportModel(
            operationType: LogbookOperationType,
            referenceReportId: String? = null,
        ): LogbookReportEntity {
            val reportId = UUID.randomUUID().toString()

            return LogbookReportEntity(
                reportId = reportId,
                referencedReportId = referenceReportId,
                analyzedByRules = null,
                externalReferenceNumber = null,
                flagState = null,
                integrationDateTime = Instant.now(),
                internalReferenceNumber = null,
                imo = null,
                ircs = null,
                message = null,
                messageType = null,
                operationCountry = null,
                operationDateTime = Instant.now(),
                operationNumber = "FAKE_OPERATION_NUMBER_$reportId",
                operationType = operationType,
                reportDateTime = null,
                software = null,
                transmissionFormat = LogbookTransmissionFormat.ERS,
                tripGears = null,
                tripNumber = null,
                tripSegments = null,
                vesselName = null,
            )
        }
    }
}
