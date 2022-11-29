package fr.gouv.cnsp.monitorfish.domain.use_cases

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.*
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.*
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

object TestUtils {
    fun getDummyLogbookMessages(): List<LogbookMessage> {
        val gearOne = Gear()
        gearOne.gear = "OTB"
        val gearTwo = Gear()
        gearTwo.gear = "DRB"

        val catchOne = Catch()
        catchOne.species = "TTV"
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        val catchThree = Catch()
        catchThree.species = "PNB"

        val dep = DEP()
        dep.gearOnboard = listOf(gearOne, gearTwo)
        dep.speciesOnboard = listOf(catchOne)
        dep.departurePort = "AEFAT"

        val far = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        haul.catches = listOf(catchTwo, catchThree)
        haul.mesh = 120.0
        far.hauls = listOf(haul)

        val coe = COE()
        coe.targetSpeciesOnEntry = "DEM"

        val cox = COX()
        cox.targetSpeciesOnExit = "DEM"

        val pno = PNO()
        pno.catchOnboard = listOf(catchOne, catchTwo, catchThree)
        pno.port = "AEJAZ"

        return listOf(
            LogbookMessage(
                id = 2, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "", operationType = LogbookOperationType.DAT, messageType = "FAR", software = "TurboCatch (3.7-1)",
                message = far, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 1, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "", operationType = LogbookOperationType.DAT, messageType = "DEP", software = "e-Sacapt Secours ERSV3 V 1.0.10",
                message = dep, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(24), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 3, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "", operationType = LogbookOperationType.DAT, messageType = "PNO", software = "e-Sacapt Secours ERSV3 V 1.0.7",
                message = pno, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(0), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 3, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "", operationType = LogbookOperationType.DAT, messageType = "COE", software = "e-Sacapt Secours ERSV3 V 1.0.7",
                message = coe, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(3), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 4, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "", operationType = LogbookOperationType.DAT, messageType = "COX", software = "e-Sacapt Secours ERSV3 V 1.0.7",
                message = cox,
                reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(0).minusMinutes(
                    20
                ),
                transmissionFormat = LogbookTransmissionFormat.ERS
            )
        )
    }

    fun getDummyFluxAndVisioCaptureLogbookMessages(): List<LogbookMessage> {
        val gearOne = Gear()
        gearOne.gear = "OTB"
        val gearTwo = Gear()
        gearTwo.gear = "DRB"

        val catchOne = Catch()
        catchOne.species = "TTV"
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        val catchThree = Catch()
        catchThree.species = "PNB"

        val dep = DEP()
        dep.gearOnboard = listOf(gearOne, gearTwo)
        dep.speciesOnboard = listOf(catchOne)
        dep.departurePort = "AEFAT"

        val far = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        haul.catches = listOf(catchTwo, catchThree)
        haul.mesh = 120.0
        far.hauls = listOf(haul)

        val pno = PNO()
        pno.catchOnboard = listOf(catchOne, catchTwo, catchThree)
        pno.port = "AEJAZ"

        return listOf(
            LogbookMessage(
                id = 1, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "", operationType = LogbookOperationType.DAT, messageType = "DEP", software = "FT/VISIOCaptures V1.4.7",
                message = dep, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(24), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 2, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "", operationType = LogbookOperationType.DAT, messageType = "FAR", software = "FP/VISIOCaptures V1.4.7",
                message = far, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 3, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "", operationType = LogbookOperationType.DAT, messageType = "PNO", software = "TurboCatch (3.6-1)",
                message = pno, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(0), transmissionFormat = LogbookTransmissionFormat.FLUX
            )
        )
    }

    fun getDummyCorrectedLogbookMessages(): List<LogbookMessage> {
        val catchOne = Catch()
        catchOne.species = "TTV"
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        val catchThree = Catch()
        catchThree.species = "PNB"

        val far = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        haul.catches = listOf(catchOne, catchTwo)
        haul.mesh = 120.0
        far.hauls = listOf(haul)

        val correctedFar = FAR()
        val correctedHaul = Haul()
        correctedHaul.gear = "OTB"
        correctedHaul.catches = listOf(catchOne, catchTwo, catchThree)
        correctedHaul.mesh = 120.0
        correctedFar.hauls = listOf(correctedHaul)

        return listOf(
            LogbookMessage(
                id = 1, analyzedByRules = listOf(), operationNumber = "9065646811", tripNumber = "345", reportId = "9065646811", operationType = LogbookOperationType.DAT, messageType = "FAR",
                message = far, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 2, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "", referencedReportId = "9065646811", operationType = LogbookOperationType.COR, messageType = "FAR",
                message = correctedFar, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.ERS
            )
        )
    }

    fun getDummyRETLogbookMessages(): List<LogbookMessage> {
        val catchOne = Catch()
        catchOne.species = "TTV"
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        val catchThree = Catch()
        catchThree.species = "PNB"

        val far = FAR()
        val haul = Haul()
        haul.gear = "OTB"
        haul.catches = listOf(catchOne, catchTwo)
        haul.mesh = 120.0
        far.hauls = listOf(haul)

        val farTwo = FAR()
        val haulTwo = Haul()
        haulTwo.gear = "OTB"
        haulTwo.catches = listOf(catchOne, catchTwo, catchThree)
        haulTwo.mesh = 120.0
        farTwo.hauls = listOf(haulTwo)

        val farAck = Acknowledge()
        farAck.returnStatus = "000"

        val farBadAck = Acknowledge()
        farBadAck.returnStatus = "002"
        farBadAck.rejectionCause = "Oops"

        return listOf(
            LogbookMessage(
                id = 1, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "9065646811", operationType = LogbookOperationType.DAT, messageType = "FAR",
                message = far, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 2, analyzedByRules = listOf(), operationNumber = "", reportId = "9065646816", referencedReportId = "9065646811", operationType = LogbookOperationType.RET, messageType = "",
                message = farBadAck, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 3, analyzedByRules = listOf(), operationNumber = "", tripNumber = "345", reportId = "9065646813", operationType = LogbookOperationType.DAT, messageType = "FAR",
                message = farTwo, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 4, analyzedByRules = listOf(), operationNumber = "", reportId = "9065646818", referencedReportId = "9065646813", operationType = LogbookOperationType.RET, messageType = "",
                message = farAck, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 5, analyzedByRules = listOf(), operationNumber = "", referencedReportId = "9065646813", operationType = LogbookOperationType.DEL, messageType = "",
                message = farAck, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 4, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.ERS
            ),
            LogbookMessage(
                id = 6, analyzedByRules = listOf(), operationNumber = "5h499-erh5u7-pm3ae8c5trj78j67dfh", tripNumber = "SCR-TTT20200505030505", reportId = "zegj15-zeg56-errg569iezz3659g", operationType = LogbookOperationType.DAT, messageType = "FAR",
                message = far, reportDateTime = ZonedDateTime.of(2020, 5, 5, 3, 9, 5, 3, UTC).minusHours(12), transmissionFormat = LogbookTransmissionFormat.FLUX
            )
        )
    }

    fun getDummyPNOAndLANLogbookMessages(weightToAdd: Double = 0.0, addSpeciesToLAN: Boolean = false): List<Pair<LogbookMessage, LogbookMessage>> {
        val catchOne = Catch()
        catchOne.species = "TTV"
        catchOne.weight = 123.0
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        catchTwo.weight = 961.5
        val catchThree = Catch()
        catchThree.species = "PNB"
        catchThree.weight = 69.7
        val catchFour = Catch()
        catchFour.species = "CQL"
        catchFour.weight = 98.2

        val catchFive = Catch()
        catchFive.species = "FGV"
        catchFive.weight = 25.5
        val catchSix = Catch()
        catchSix.species = "THB"
        catchSix.weight = 35.0
        val catchSeven = Catch()
        catchSeven.species = "VGY"
        catchSeven.weight = 66666.0
        val catchEight = Catch()
        catchEight.species = "MQP"
        catchEight.weight = 11.1

        val catchNine = Catch()
        catchNine.species = "FPS"
        catchNine.weight = 22.0

        val catchTen = Catch()
        catchTen.species = "DPD"
        catchTen.weight = 2225.0

        val firstLan = LAN()
        firstLan.catchLanded = listOf(catchOne, catchTwo, catchThree, catchFour, catchNine)

        val firstPno = PNO()
        firstPno.catchOnboard = listOf(
            catchOne.copy(weight = catchOne.weight?.plus(weightToAdd)),
            catchTwo.copy(weight = catchTwo.weight?.plus(0.5)),
            catchThree.copy(weight = catchThree.weight?.plus(weightToAdd)),
            catchFour
        )

        val secondLan = LAN()
        if (addSpeciesToLAN) {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight, catchTen)
        } else {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight)
        }
        val secondPno = PNO()
        secondPno.catchOnboard = listOf(catchFive, catchSix, catchSeven, catchEight)

        return listOf(
            Pair(
                LogbookMessage(
                    id = 1, analyzedByRules = listOf(), operationNumber = "456846844658", tripNumber = "125345", reportId = "456846844658",
                    operationType = LogbookOperationType.DAT, messageType = "LAN", message = firstLan, transmissionFormat = LogbookTransmissionFormat.ERS
                ),
                LogbookMessage(
                    id = 2, analyzedByRules = listOf(), operationNumber = "47177857577", tripNumber = "125345", reportId = "47177857577",
                    operationType = LogbookOperationType.DAT, messageType = "PNO", message = firstPno, transmissionFormat = LogbookTransmissionFormat.ERS
                )
            ),
            Pair(
                LogbookMessage(
                    id = 3, analyzedByRules = listOf(), operationNumber = "48545254254", tripNumber = "125345", reportId = "48545254254",
                    operationType = LogbookOperationType.DAT, messageType = "LAN", message = secondLan, transmissionFormat = LogbookTransmissionFormat.ERS
                ),
                LogbookMessage(
                    id = 4, analyzedByRules = listOf(), operationNumber = "004045204504", tripNumber = "125345", reportId = "004045204504",
                    operationType = LogbookOperationType.DAT, messageType = "PNO", message = secondPno, transmissionFormat = LogbookTransmissionFormat.ERS
                )
            )
        )
    }

    fun getDummyPNOAndLANLogbookMessagesWithSpeciesInDouble(weightToAdd: Double = 0.0, addSpeciesToLAN: Boolean = false): List<Pair<LogbookMessage, LogbookMessage>> {
        val catchOne = Catch()
        catchOne.species = "TTV"
        catchOne.weight = 123.0
        val catchTwo = Catch()
        catchTwo.species = "SMV"
        catchTwo.weight = 961.5
        val catchThree = Catch()
        catchThree.species = "PNB"
        catchThree.weight = 69.7
        val catchFour = Catch()
        catchFour.species = "CQL"
        catchFour.weight = 98.2

        val catchFive = Catch()
        catchFive.species = "FGV"
        catchFive.weight = 25.5
        val catchSix = Catch()
        catchSix.species = "THB"
        catchSix.weight = 35.0
        val catchSeven = Catch()
        catchSeven.species = "VGY"
        catchSeven.weight = 66666.0
        val catchEight = Catch()
        catchEight.species = "MQP"
        catchEight.weight = 11.1

        val catchNine = Catch()
        catchNine.species = "FPS"
        catchNine.weight = 22.0

        val catchTen = Catch()
        catchTen.species = "DPD"
        catchTen.weight = 2225.0

        val firstLan = LAN()
        firstLan.catchLanded = listOf(catchOne, catchTwo, catchTwo, catchTwo, catchThree, catchFour, catchNine)

        val firstPno = PNO()
        firstPno.catchOnboard = listOf(
            catchOne.copy(weight = catchOne.weight?.plus(weightToAdd)),
            catchTwo.copy(weight = catchTwo.weight?.plus(0.5)),
            catchTwo,
            catchThree.copy(weight = catchThree.weight?.plus(weightToAdd)),
            catchFour
        )

        val secondLan = LAN()
        if (addSpeciesToLAN) {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight, catchTen)
        } else {
            secondLan.catchLanded = listOf(catchFive, catchSix, catchSeven, catchEight)
        }
        val secondPno = PNO()
        secondPno.catchOnboard = listOf(catchFive, catchSix, catchSeven, catchEight)

        return listOf(
            Pair(
                LogbookMessage(
                    id = 1, analyzedByRules = listOf(), operationNumber = "456846844658", tripNumber = "125345", reportId = "456846844658",
                    operationType = LogbookOperationType.DAT, messageType = "LAN", message = firstLan, transmissionFormat = LogbookTransmissionFormat.ERS
                ),
                LogbookMessage(
                    id = 2, analyzedByRules = listOf(), operationNumber = "47177857577", tripNumber = "125345", reportId = "47177857577",
                    operationType = LogbookOperationType.DAT, messageType = "PNO", message = firstPno, transmissionFormat = LogbookTransmissionFormat.ERS
                )
            ),
            Pair(
                LogbookMessage(
                    id = 3, analyzedByRules = listOf(), operationNumber = "48545254254", tripNumber = "125345", reportId = "48545254254",
                    operationType = LogbookOperationType.DAT, messageType = "LAN", message = secondLan, transmissionFormat = LogbookTransmissionFormat.ERS
                ),
                LogbookMessage(
                    id = 4, analyzedByRules = listOf(), operationNumber = "004045204504", tripNumber = "125345", reportId = "004045204504",
                    operationType = LogbookOperationType.DAT, messageType = "PNO", message = secondPno, transmissionFormat = LogbookTransmissionFormat.ERS
                )
            )
        )
    }
}
